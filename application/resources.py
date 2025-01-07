from flask_restful import Resource, Api, reqparse, marshal_with, fields, marshal
from flask import request, jsonify
import datetime
from sqlalchemy.orm import joinedload, aliased
from sqlalchemy import func
from flask_security import auth_required, roles_required, current_user
from .models import db, Service, User, ServiceRequest, Professional
from .instances import cache

api = Api(prefix='/api')

# -----------------------------------------------Service API--------------------------------------------------------

service_parser = reqparse.RequestParser()
service_parser.add_argument('name', type=str, required=True, help="Name cannot be blank, add a service name")
service_parser.add_argument('description', type=str, required=True, help="Description cannot be blank, enter description of the service")
service_parser.add_argument('base_price', type=float, required=True, help="Base price cannot be blank, enter base price in rupees")
service_parser.add_argument('time_required', type=int, required=True, help="Time required cannot be blank, enter time required for the service in minutes")

service_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'base_price': fields.Float,
    'time_required': fields.Integer,
    'average_rating': fields.Float,
}

class Services(Resource):
    @marshal_with(service_fields)
    @cache.cached(timeout=60)
    def get(self): 
        all_services = Service.query.all()
        
        for service in all_services:
            service_requests = ServiceRequest.query.filter_by(service_id=service.id).all()
            total_rating = 0
            rating_count = 0
            
            for request in service_requests:
                if request.rating > 0:
                    total_rating += request.rating
                    rating_count += 1

    
            if rating_count > 0:
                service.average_rating = total_rating / rating_count
                service.average_rating= round(service.average_rating, 2)
            else:
                service.average_rating = None
        
        return all_services, 200

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        args = service_parser.parse_args()
        new_service = Service()
        name=args.get('name')
        if name is None:
            return {"message": "Name cannot be blank"}, 400
        new_service.name = name

        desc=args.get('description')
        if desc is None:
            return {"message": "Description cannot be blank"}, 400
        new_service.description = desc

        base_price=args.get('base_price')
        if base_price is None:
            return {"message": "Base price cannot be blank"}, 400
        new_service.base_price = base_price//1000

        time_required=args.get('time_required')
        if time_required is None:
            return {"message": "Time required cannot be blank"}, 400
        new_service.time_required = time_required

        db.session.add(new_service)
        db.session.commit()
        return {
            "message": "Service added successfully",
            "service": marshal(new_service, service_fields)
        }, 201
    

    @auth_required('token')
    @roles_required('admin')
    def put(self):
        data = request.get_json()
        if not data:
            return {"message": "Invalid input, JSON data expected"}, 400

        service_id = data.get('id')
        if not service_id:
            return {"message": "Service ID is required for editing"}, 400

        service = Service.query.get(service_id)
        if not service:
            return {"message": "Service not found"}, 404


        service.name = data.get('name', service.name)
        service.description = data.get('description', service.description)
        service.base_price = data.get('base_price', service.base_price)
        service.time_required = data.get('time_required', service.time_required)

        db.session.commit()
        return {
            "message": "Service updated successfully",
            "service": marshal(service, service_fields)
        }, 200

    @auth_required('token')
    @roles_required('admin')
    def delete(self):
        parser = reqparse.RequestParser()
        parser.add_argument('id', type=int, required=True, help="Service ID is required for deletion")
        args = parser.parse_args()

        service = Service.query.get(args.get('id'))
        if not service:
            return {"message": "Service not found"}, 404

        db.session.delete(service)
        db.session.commit()
        return {"message": "Service deleted successfully"}, 200


api.add_resource(Services, '/services')

# -----------------------------------------------User API--------------------------------------------------------

user_parser = reqparse.RequestParser()
user_parser.add_argument('email', type=str, required=True, help="Email cannot be blank")
user_parser.add_argument('password', type=str, required=True, help="Password cannot be blank")
user_parser.add_argument('name', type=str, required=True, help="Name cannot be blank")
user_parser.add_argument('phone', type=str, required=True, help="Phone cannot be blank")
user_parser.add_argument('address', type=str, required=True, help="Address cannot be blank")
user_parser.add_argument('roles', type=list, location='json', required=True, help="Roles cannot be blank")

user_fields = {
    'id': fields.Integer,
    'email': fields.String,
    'name': fields.String,
    'phone': fields.String,
    'address': fields.String,
    'roles': fields.List(fields.String)
}


class Users(Resource):
    @marshal_with(user_fields)
    @auth_required('token')
    @roles_required('admin')
    @cache.cached(timeout=120)
    def get(self):  
        all_users = User.query.all()

        users = []
        for user in all_users:
            user_data = marshal(user, user_fields) 
            user_data['roles'] = [role.name for role in user.roles]
            users.append(user_data)

        return users, 200


    def post(self):
        args = user_parser.parse_args()
        new_user = User(
            email=args['email'],
            password=args['password'],  
            name=args['name'],
            phone=args['phone'],
            address=args['address']
        )
        db.session.add(new_user)
        db.session.commit()
        return {
            "message": "User added successfully", 
            "user": marshal(new_user, user_fields)
        }, 201

api.add_resource(Users, '/users')

# -----------------------------------------------Service Request API----------------------------------------------

service_request_parser = reqparse.RequestParser()
service_request_parser.add_argument('completion_time', type=int, required=True, help="Completion time cannot be blank")
service_request_parser.add_argument('status', type=str, required=True, help="Status cannot be blank")
service_request_parser.add_argument('remarks', type=str)
service_request_parser.add_argument('service_id', type=int, required=True, help="Service ID cannot be blank")
service_request_parser.add_argument('user_id', type=int, required=True, help="User ID cannot be blank")
service_request_parser.add_argument('professional_id', type=int, required=True, help="Professional ID cannot be blank")

service_request_fields = {
    'id': fields.Integer,
    'request_date': fields.DateTime,
    'completion_time': fields.Integer,
    'status': fields.String,
    'remarks': fields.String,
    'service_id': fields.Integer,
    'user_id': fields.Integer,
    'professional_id': fields.Integer
}

class Admin_service_req(Resource):
    @auth_required('token')
    @roles_required('admin')
    @cache.cached(timeout=60)
    def get(self):  
        all_service_requests = ServiceRequest.query.all()

        response = []
        for request in all_service_requests:
            response.append({
                "id": request.id,
                "service": {
                    "name": request.professional.service_type,
                },
                "professional": {
                    "name": request.professional.user.name if request.professional else None,
                    "phone": request.professional.user.phone,
                    "email":request.professional.user.email,
                },
                "user": {"name":request.customer.name,
                        "phone" :request.customer.phone,
                        "email": request.customer.email,
                        },

                "request_date": request.request_date.isoformat(),
                "status": request.status,
                "remarks": request.remarks,
                "rating": request.rating
            })

        return response, 200
    
    def delete(self):
        id=request.get_json()
        service_request = ServiceRequest.query.get(id)
        if service_request.professional.availability_status==False:
            service_request.professional.availability_status=True
        db.session.delete(service_request)
        db.session.commit()
        return {'message': 'Service request deleted'}, 200
    
api.add_resource(Admin_service_req, '/admin_service_requests')



class ServiceRequests(Resource):
    @auth_required('token')
    @roles_required('professional')
    @cache.cached(timeout=60)
    def get(self, prof_id):
        try:
            professional = Professional.query.options(
                joinedload(Professional.service_requests).joinedload(ServiceRequest.service)
            ).filter_by(id=prof_id).first()

            if not professional:
                return {"message": "Professional not found"}, 404

    
            service_requests = [
                {
                    "id": req.id,
                    "remarks": req.remarks,
                    "rating": req.rating,
                    "request_date": req.request_date.isoformat(),
                    "status": req.status,
                    "service": {"name": professional.service_type},
                    "customer": {"name": req.customer.name, "phone": req.customer.phone, "address": req.customer.address},
                }
                for req in professional.service_requests
            ]
            return service_requests, 200

        except Exception as e:
            return {"message": f"Error: {str(e)}"}, 500
    



    @auth_required('token')
    @roles_required('customer')
    def post(self):
        try:
            args = service_request_parser.parse_args()
            service_id = args.get('service_id')
            user_id = args.get('user_id')
            professional_id = args.get('professional_id')
            completion_time = args.get('completion_time')
            status = args.get('status')

            service = Service.query.get(service_id)
            if not service:
                return {"message": "Service not found"}, 404

            user = User.query.get(user_id)
            if not user:
                return {"message": "User not found"}, 404

            professional = Professional.query.get(professional_id)
            if not professional:
                return {"message": "Professional not found"}, 404

            service_request = ServiceRequest(
                service_id=service_id,
                user_id=user_id,
                professional_id=professional_id,
                completion_time=completion_time,
                status=status,
            )

            db.session.add(service_request)
            db.session.commit()

            professional.availability_status = False
            db.session.commit()

            return {
                "message": "Service Request sent successfully",
                "service_request": marshal(service_request, service_request_fields)
            }, 201
        except Exception as e:
            print(f"Error occurred: {str(e)}")
            return {"message": "Internal Server Error", "error": str(e)}, 500
    
    @auth_required('token')
    @roles_required('admin')
    def delete(self):
        id=request.get_json()
        service=Service.query.find(id=id)
        db.session.delete(service)
        db.session.commit()

api.add_resource(ServiceRequests, '/service_requests', '/service_requests/<int:prof_id>')


class ServiceProf(Resource):
    @auth_required('token')
    @roles_required('professional')
    def put(self, id):

        data = request.get_json()
        new_status = data.get('status')
        print(new_status)
        # Validate the status field
        if not new_status or new_status not in ['Accepted', 'Rejected', 'Ongoing', 'Completed']:
            return {"message": "Invalid status value"}, 400

        # Fetch the service request by ID
        service_request = ServiceRequest.query.get(id)
        if not service_request:
            return {"message": "Service request not found"}, 404

        if new_status == 'Accepted':
            service_request.status = new_status
            service_request.professional.availability_status=False
            db.session.commit()
            return {"message": "Service request accepted please reach the customer."}, 200
        
        elif new_status == 'Rejected':
            service_request.status = new_status
            service_request.professional.availability_status=True
            db.session.commit()
            return {"message": "Service request rejected."}, 200
        
        elif new_status == 'Ongoing':
            service_request.status = new_status
            service_request.professional.availability_status=False
            db.session.commit()
            return {"message": "Service request in progress please reach the customer."}, 200
        
        elif new_status == 'Completed':
            service_request.status = new_status
            service_request.professional.availability_status=True
            db.session.commit()
            return {"message": "Service request completed please reach the customer."}, 200
    

api.add_resource(ServiceProf, '/service_prof/<int:id>')


class ServiceUser(Resource):
    @auth_required('token')
    @roles_required('customer')
    @cache.cached(timeout=60)
    def get(self, user_id):
        service_requests = ServiceRequest.query.filter_by(user_id=user_id).all()

        if not service_requests:
            return {"message": "No service requests found"}, 404

        response = []
        for request in service_requests:
            response.append({
                "id": request.id,
                "service": {
                    "name": request.service.name,
                    "description": request.service.description,
                },
                "professional": {
                    "name": request.professional.user.name if request.professional else None,
                },
                "request_date": request.request_date.isoformat(),
                "status": request.status,
                "remarks": request.remarks,
                "completion_time": request.completion_time
            })

        return response, 200


api.add_resource(ServiceUser, '/service_req_user/<int:user_id>')

class Close_service(Resource):
    @auth_required('token')
    @roles_required('customer')
    def put(self, request_id):
        # Fetch the service request
        service_request = ServiceRequest.query.get(request_id)

        if not service_request:
            return {"message": f"Service request with ID {request_id} not found"}, 404

        # Parse JSON data from request
        data = request.get_json()
        if "status" in data and "rating" in data and "remarks" in data:
            try:
                # Update service request fields
                service_request.status = data["status"]
                if service_request.rating==0.1:
                    service_request.rating= data["rating"]
                else:
                    service_request.rating = (service_request.rating + data["rating"]) / 2
                service_request.remarks = data["remarks"]
                service_request.professional.availability_status=True
                db.session.commit()
                return {"message": "Service request updated successfully"}, 200
            except Exception as e:
                return {"message": f"Error updating service request: {str(e)}"}, 500

        return {"message": "Invalid data. 'status', 'rating', and 'remarks' are required."}, 400


# Add route to API
api.add_resource(Close_service, "/close/<int:request_id>")

# -----------------------------------------------Professional API------------------------------------------------

professional_parser = reqparse.RequestParser()
professional_parser.add_argument('user_id', type=int, required=True, help="User ID cannot be blank")
professional_parser.add_argument('service_type', type=str, required=True, help="Service type cannot be blank")
professional_parser.add_argument('experience', type=int, required=True, help="Experience cannot be blank")
professional_parser.add_argument('verified', type=bool, required=True, help="Verified status cannot be blank")
professional_parser.add_argument('availability_status', type=bool, required=True, help="Availability status cannot be blank")

class Professionals(Resource):
    @auth_required('token')
    @roles_required('customer')
    @cache.cached(timeout=60)
    def get(self):
        service_id = request.args.get('service_id', type=int)

        if not service_id:
            return {"message": "The 'service_id' query parameter is required and must be a valid integer."}, 400

        try:
            profs = Professional.query.filter_by(service_id=service_id).options(joinedload(Professional.user)).all()
            professionals=[]
            for prof in profs:

                if prof.availability_status:  
                    service_requests = ServiceRequest.query.filter_by(professional_id=prof.id).all()
                    total_rating = 0
                    rating_count = 0
                    
                    for req in service_requests:
                        if req.rating > 0:
                            total_rating += req.rating
                            rating_count += 1
                    
                    average_rating =round(total_rating / rating_count, 2) if rating_count > 0 else None

                    professionals.append({
                        "id": prof.id,
                        "user_id": prof.user_id,
                        "name": prof.user.name,
                        "phone": prof.user.phone,
                        "service_type": prof.service_type,
                        "experience": prof.experience,
                        "availability_status": prof.availability_status,
                        "average_rating": average_rating 
                    })

            if not professionals:
                return {"message": f"No professionals found for service_id {service_id} or none are currently available."}, 404

            return professionals, 200

        except Exception as e:
            return {"message": f"An error occurred while fetching data: {str(e)}"}, 500
    

    def post(self):
        professional_fields = {
            'service_type': fields.String,
            'experience': fields.Integer
        }
        args = professional_parser.parse_args()
        new_professional = Professional(**args)
        db.session.add(new_professional)
        db.session.commit()
        return {
            "message": "Professional added successfully", 
            "professional": marshal(new_professional, professional_fields)
        }, 201

api.add_resource(Professionals, '/professionals')



class SummaryAdmin(Resource):
    @auth_required('token')
    @roles_required('admin')
    @cache.cached(timeout=120)
    def get(self):
        try:

            user_count = User.query.count()

    
            professional_count = Professional.query.count()

            service_count = Service.query.count()

        
            service_request_count = ServiceRequest.query.count()

        
            avg_rating = db.session.query(func.avg(ServiceRequest.rating)).filter(
                ServiceRequest.status == 'Closed' and ServiceRequest.rating != 0.1).scalar()
            avg_rating = round(avg_rating, 2) if avg_rating else 0  

            return {
                'user_count': user_count,
                'prof_count': professional_count,
                'service_count': service_count,
                'service_request_count': service_request_count,
                'average_rating': avg_rating,
            }, 200

        except Exception as e:
            return {'error': str(e)}, 500
        
api.add_resource(SummaryAdmin, '/summary-admin')



class Summaryuser(Resource):
    @auth_required('token')
    @roles_required('customer')
    @cache.cached(timeout=30)
    def get(self):
        user_id = request.args.get('user_id', type=int)
        if not user_id:
            return {"error": "User ID is required"}, 400

        service_requests = ServiceRequest.query.filter_by(user_id=user_id).all()

        on = 0
        off = 0
        req = 0
        rej = 0

        for service in service_requests:
            if service.status == "Ongoing":
                on += 1
            elif service.status == "Requested":
                req += 1
            elif service.status == "Rejected":
                rej += 1
            else:
                off += 1
        
        return {
            'ongoing': on,
            'rejected': rej,
            'closed': off,
            'requested': req
        }, 200

api.add_resource(Summaryuser, '/summary-user')

class Summaryprof(Resource):
    @auth_required('token')
    @roles_required('professional')
    @cache.cached(timeout=120)
    def get(self):
        prof_id = request.args.get('prof_id', type=int)
        if not prof_id:
            return {"error": "Professional ID is required"}, 400

        service_requests = ServiceRequest.query.filter_by(professional_id=prof_id).all()

        on = 0
        off = 0
        req = 0
        rej = 0
        total_rating = 0
        rating_count = 0

        for service in service_requests:
            if service.status == "Ongoing":
                on += 1
            elif service.status == "Requested":
                req += 1
            elif service.status == "Rejected":
                rej += 1
            else:
                off += 1
            

            if service.rating > 0.1:
                total_rating += service.rating
                rating_count += 1
    
        avg_rating = total_rating / rating_count if rating_count > 0 else 0

        return {
            'ongoing': on,
            'rejected': rej,
            'closed': off,
            'requested': req,
            'average_rating': avg_rating
        }, 200

api.add_resource(Summaryprof, '/summary-prof')


