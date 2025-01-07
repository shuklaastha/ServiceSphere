from app import app
from application.models import *
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash
from application.sec import datastore
import uuid

with app.app_context():
    # Ensure roles table exists before creating any foreign key dependency
    db.create_all()

    # Create roles if they do not exist
    datastore.find_or_create_role(name="admin", description="User with administrative privileges")
    datastore.find_or_create_role(name="professional", description="Service professional user")
    datastore.find_or_create_role(name="customer", description="Regular customer user")

    db.session.commit()

    fs_uniquifier = str(uuid.uuid4())

    # Create admin user if not already created
    if not datastore.find_user(email="admin@example.com"):
        datastore.create_user(
            email="admin@gmail.com",
            password=generate_password_hash("admin"),
            name="Astha Shukla",
            phone=9999888822,
            address="Vikas Nagar",
            roles=["admin"]
        )

    # Create customer user
    if not datastore.find_user(email="abc@example.com"):
        datastore.create_user(
            email="abc@gmail.com",
            password=generate_password_hash("qwer"),
            name="astha",
            phone="1234567890",
            address="123 Main St",
            roles=["customer"],
            registered_on=datetime.now(timezone.utc)
        )

    # Create professional user
    if not datastore.find_user(email="sdf@example.com"):
        user_2 = datastore.create_user(
            email="sdf@gmail.com",
            password=generate_password_hash("zxcv"),
            name="aditya",
            phone="9876540923",
            address="xyz",
            active=False,
            roles=["professional"],
            registered_on=datetime.now(timezone.utc),
        )
    
        db.session.commit()

        # Add a Professional profile for the created user
        professional = Professional(
            user_id=user_2.id,
            service_type="Toilet Cleaning",
            experience=5,
            service_id=1,
            availability_status=False
        )
        db.session.add(professional)

    # Add a service
    if not Service.query.filter_by(name="Cleaning").first():
        service = Service(
            name="Cleaning",
            description="Cleaning service",
            base_price=200,
            time_required=30
        )
        db.session.add(service)

    db.session.commit()

    # Add a service request
    service = Service.query.filter_by(name="Cleaning").first()
    customer = User.query.filter_by(email="abc@example.com").first()
    professional = Professional.query.join(User).filter(User.email == "sdf@example.com").first()

    if service and customer and professional:
        servicerequest = ServiceRequest(
            request_date=datetime.now(timezone.utc),
            status="completed",
            completion_time=service.time_required,
            remarks="N/A",
            rating=3.0,
            service_id=service.id,
            user_id=customer.id,
            professional_id=professional.id
        )
        db.session.add(servicerequest)

    db.session.commit()
