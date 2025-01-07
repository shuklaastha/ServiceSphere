from flask import current_app as app, jsonify, request, render_template, send_file
from sqlalchemy.orm import joinedload
from flask_security import auth_required, roles_required
from werkzeug.security import check_password_hash, generate_password_hash
from flask_restful import marshal, fields
from sqlalchemy import or_, func
import flask_excel as excel
from celery.result import AsyncResult
from .tasks import download_csv
from .models import User, Role, Professional, Service, ServiceRequest, db
from .sec import datastore
from datetime import datetime, timezone



@app.get('/')
def home():
    return render_template('index.html')

@app.get('/admin')
@auth_required('token')
@roles_required('admin')
def admin():
    return 'welcome admin'



@app.get('/activate_professional/<int:prof_id>')
@auth_required('token')
@roles_required('admin')
def activate_professional(prof_id):
    try:
        professional = User.query.get(prof_id)
        
        if not professional:
            return jsonify({"message": "User not found"}), 404
        
        if professional.professional_profile:
            professional.active = True
            professional.professional_profile.availability_status = True
        else:
            professional.active = True
        
        db.session.commit()
        
        return jsonify({"message": "User activated successfully"}), 200

    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500

@app.post('/deactivate_professional/<int:prof_id>')
@auth_required('token')
@roles_required('admin')
def deactivate_professional(prof_id):
    try:
        professional = User.query.get(prof_id)
        
        if not professional:
            return jsonify({"message": "User not found"}), 404
        
        if professional.professional_profile:
            professional.active = False
            professional.professional_profile.availability_status = False
        else:
            professional.active = False
        
        db.session.commit()  
        
        return jsonify({"message": "User deactivated successfully"}), 200

    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500



@app.post('/user_login')
def user_login():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"message": "Email cannot be blank"}), 400

    # Find user by email
    user = datastore.find_user(email=email)
    if not user:
        return jsonify({"message": "User not found, please sign up"}), 404

    # Check for password
    password = data.get("password")
    if not password:
        return jsonify({"message": "Password cannot be blank"}), 400
    

    if not check_password_hash(user.password, password):
        return jsonify({"message": "Wrong password, try again!"}), 401

    # Construct response
    response = {
        "token": user.get_auth_token(),
        "name": user.name,
        "id": user.id,  # Default ID for user
        "mail": user.email,
        "role": user.roles[0].name if user.roles else None, 
        "active": user.active,
    }

    # Include professional ID if the user is a professional
    if "professional" in response["role"] and user.professional_profile:
        response["professional_id"] = user.professional_profile.id

    return jsonify(response), 200

    
user_fields = {
    "name": fields.String,
    "id": fields.Integer,
    "email": fields.String,
    "active": fields.Boolean,
    "roles": fields.List(fields.String),
    "professional_data": fields.Raw 
}

@app.get('/users')
@auth_required("token")
@roles_required("admin")
def all_users():
    all_users = User.query.all()

    users = []
    for user in all_users:
        user_data = marshal(user, user_fields)  
        roles = [role.name for role in user.roles] 
        user_data['roles'] = roles[0]

        #professional-specific data
        if "professional" in roles:
            professional = user.professional_profile
            if professional:
                user_data["professional_data"] = {
                    "service_type": professional.service_type,
                    "experience": professional.experience,
                    "availability_status": professional.availability_status,
                }
            else:
                user_data["professional_data"] = None
        
        users.append(user_data)

    if len(users) == 0:
        return jsonify({"message": "No users found"}), 404

    return users, 200




@app.route('/api/register_user', methods=['POST'])
def register_user():
    data = request.get_json()

    # Validate incoming data
    required_fields = ['email', 'password', 'name', 'phone', 'address', 'roles']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already in use"}), 400

    # Hash password
    hashed_password = generate_password_hash(data['password'])

    # Create new user
    new_user = User(
        email=data['email'],
        password=hashed_password,
        name=data['name'],
        phone=data['phone'],
        address=data['address'],
        registered_on=datetime.now(timezone.utc)
    )

    # Add roles to user
    for role_name in data['roles']:
        role = Role.query.filter_by(name=role_name).first()
        if role:
            new_user.roles.append(role)
        else:
            return jsonify({"error": f"Role '{role_name}' not found"}), 400

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error registering user: {str(e)}"}), 500




@app.post('/api/register_professional')
def register_professional():
    data = request.get_json()

    # Validate incoming data
    required_fields = ['email', 'password', 'name', 'phone', 'address', 'roles', 'service_type', 'experience']
    missing_fields = [field for field in required_fields if field not in data]

    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already in use"}), 400

    # Hash password
    hashed_password = generate_password_hash(data['password'])

    # Create new user for professional
    new_user = User(
        email=data['email'],
        password=hashed_password,
        name=data['name'],
        phone=data['phone'],
        address=data['address'],
        registered_on=datetime.now(timezone.utc),
        active=False
    )

    # Add roles to the user
    for role_name in data['roles']:
        role = Role.query.filter_by(name=role_name).first()
        if role:
            new_user.roles.append(role)
        else:
            return jsonify({"error": f"Role '{role_name}' not found"}), 400

    try:
        db.session.add(new_user)
        db.session.commit()

        # Create professional profile
        service = Service.query.filter_by(id=data['service_category']).first()
        if not service:
            return jsonify({"error": "Service type not found"}), 400

        professional = Professional(
            user_id=new_user.id,
            service_type=data['service_type'],
            experience=data['experience'],
            service_id=data['service_category'],
            availability_status=False  # Default to unavailable
        )

        print(professional.service_id)
        
        db.session.add(professional)
        db.session.commit()
        return jsonify({"message": "Professional registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error registering professional: {str(e)}"}), 500
    

@app.route('/search-user')
@auth_required('token')
@roles_required('customer')
def search():
    query = request.args.get('query', '').strip() 
    filters = []

    if query:

        filters.append(Service.name.ilike(f'%{query}%'))
        filters.append(Service.description.ilike(f'%{query}%'))
        filters.append(Service.base_price.ilike(f'%{query}%'))

        filters.append(Professional.service_type.ilike(f'%{query}%'))
        filters.append(User.name.ilike(f'%{query}%'))


    services = Service.query.filter(or_(*filters)).all()


    professionals = Professional.query.join(User).join(Service).filter(
        Professional.availability_status == True,
        User.active == True,
        or_(
            User.name.ilike(f'%{query}%'),
            Professional.service_type.ilike(f'%{query}%')
        )
    ).all()


    service_data = [
        {
            'id': service.id,
            'name': service.name,
            'base_price': service.base_price,
            'time_required': service.time_required,
            'description': service.description,
        }
        for service in services
    ]

    professional_data = [
        {
            'id': prof.id,
            'name': prof.user.name,
            'service_type': prof.service_type,
            'experience': prof.experience,
            'phone': prof.user.phone,
        }
        for prof in professionals
    ]

    return jsonify({'services': service_data, 'professionals': professional_data})


@app.route('/admin-search')
@auth_required('token')
@roles_required('admin')
def admin_search():
    query = request.args.get('query').strip()
    if not query:
        return jsonify({'error': 'Query parameter is required'}), 400

    services = Service.query.filter(
        or_(
            Service.name.ilike(f'%{query}%'),
            Service.base_price.ilike(f'%{query}%'),
            Service.description.ilike(f'%{query}%')
        )
    ).all()

    servicereq = ServiceRequest.query.options(
        joinedload(ServiceRequest.professional)
    ).filter(
        or_(
            Professional.service_type.ilike(f'%{query}%'),
            ServiceRequest.remarks.ilike(f'%{query}%'),
            ServiceRequest.status.ilike(f'%{query}%'),
        )
    ).join(Professional, ServiceRequest.professional).all()

    users_ = User.query.filter(
        or_(
            User.name.ilike(f'%{query}%'),
            User.email.ilike(f'%{query}%'),
            User.address.ilike(f'%{query}%')
        )
    ).all()


    profs = []
    users = []

    for user in users_:
    
        if 'professional' in [role.name for role in user.roles]:
            if user.professional_profile:
                profs.append(user)
        
        elif 'customer' in [role.name for role in user.roles]:
            users.append(user)

    user_data = [
        {
            'id': user.id,
            'name': user.name,
            'address': user.address,
            'contact': user.phone,
            'email': user.email,
            'active': user.active,
        }
        for user in users
    ]

    prof_data = [
        {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'active': user.active,
            'service_type': user.professional_profile.service_type,
            'availability': user.professional_profile.availability_status,
            'experience': user.professional_profile.experience,
        }
        for user in profs
    ]

    service_data = [
        {
            'id': service.id,
            'name': service.name,
            'description': service.description,
            'base_price': service.base_price,
            'time_required': service.time_required,
        }
        for service in services
    ]

    servicereq_data = [
        {
            'id': req.id,
            'service': req.professional.service_type,
            'customer_name': req.customer.name,
            'customer_email': req.customer.email,
            'request_date': req.request_date,
            'remarks': req.remarks,
            'status': req.status,
            'rating': req.rating,
            'professional_name': req.professional.user.name,
            'professional_email': req.professional.user.email,
        }
        for req in servicereq
    ]

    return jsonify({
        'services': service_data,
        'serviceRequests': servicereq_data,
        'users': user_data,
        'professionals': prof_data
    })

@app.route('/search-professional')
@auth_required('token')
@roles_required('professional')
def prof_search():
    query = request.args.get('query').strip()
    prof_id=request.args.get('prof_id')

    if not query:
        return jsonify({'error': 'Query parameter is required'}), 400
    
    servicereq = ServiceRequest.query.filter(
        ServiceRequest.professional_id == prof_id
    ).filter(
        or_(
            ServiceRequest.status.ilike(f'%{query}%'),
            ServiceRequest.remarks.ilike(f'%{query}%'),
            User.name.ilike(f'%{query}%'),
            User.email.ilike(f'%{query}%')
        )
    ).join(User, ServiceRequest.customer).all()

    pending = []
    done = []

    for req in servicereq:
        request_data = {
            'service_type': req.professional.service_type,
            'customer_name': req.customer.name,
            'customer_phone': req.customer.phone,
            'address': req.customer.address,
            'request_date': req.request_date,
            'status': req.status,
            'remarks': req.remarks,
            'rating': req.rating
        }

        if req.status.lower() == 'requested':  
            pending.append(request_data)
        else:  
            done.append(request_data)

    return jsonify({'pending': pending, 'done': done})



@app.get('/download-csv')
def download():
    task=download_csv.delay()
    return jsonify({'task_id': task.id}), 200



@app.get('/get-csv/<task_id>')
def get_csv(task_id):
    res=AsyncResult(task_id)
    if res.ready():
        filename=res.result 
        return send_file(filename, as_attachment=True)
    else:
        return jsonify({'error': 'Task Pending'}), 404
