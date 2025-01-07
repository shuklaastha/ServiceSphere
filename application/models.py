from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from datetime import datetime, timezone
from uuid import uuid4

db = SQLAlchemy()


user_roles = db.Table('user_roles',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('role_id', db.Integer, db.ForeignKey('role.id'), primary_key=True)
)


class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(20), unique=True, nullable=False)  # 'admin', 'professional', 'customer'
    description = db.Column(db.String(100), nullable=True)


class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    phone = db.Column(db.String(15), nullable=False, unique=True)
    address = db.Column(db.String(200), nullable=False)
    registered_on = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    active=db.Column(db.Boolean, default=True)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False, default=lambda: str(uuid4()))

    roles = db.relationship('Role', secondary=user_roles, backref=db.backref('users', lazy='dynamic'))
    service_requests = db.relationship('ServiceRequest', back_populates='customer', foreign_keys='ServiceRequest.user_id')
    professional_profile = db.relationship('Professional', back_populates='user', uselist=False)

# Professional model
class Professional(db.Model):
    __tablename__ = 'professional'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    service_type = db.Column(db.String(100), nullable=False)
    experience = db.Column(db.Integer, nullable=False)
    availability_status = db.Column(db.Boolean, default=False)

    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)

    user = db.relationship('User', back_populates='professional_profile')
    service = db.relationship('Service', back_populates='professionals')
    service_requests = db.relationship('ServiceRequest', back_populates='professional', foreign_keys='ServiceRequest.professional_id')


# Service model
class Service(db.Model):
    __tablename__ = 'service'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    base_price = db.Column(db.Float, nullable=False)
    time_required = db.Column(db.Integer, nullable=False)  # In minutes

    requests = db.relationship('ServiceRequest', back_populates='service')
    professionals = db.relationship('Professional', back_populates='service')  # Relationship to Professional


# ServiceRequest model
class ServiceRequest(db.Model):
    __tablename__ = 'service_request'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    request_date = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    completion_time = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(20), nullable=False, default='Requested')  # 'Requested', 'Ongoing', 'Closed', 'Rejected'
    remarks = db.Column(db.Text)
    rating = db.Column(db.Float, default=0.1)

    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    service = db.relationship('Service', back_populates='requests')

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    customer = db.relationship('User', back_populates='service_requests', foreign_keys=[user_id])

    professional_id = db.Column(db.Integer, db.ForeignKey('professional.id'), nullable=True)
    professional = db.relationship('Professional', back_populates='service_requests', foreign_keys=[professional_id])
