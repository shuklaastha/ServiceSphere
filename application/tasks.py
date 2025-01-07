from celery import shared_task
from .models import ServiceRequest, User, Professional
import flask_excel as excel
from jinja2 import Template
from .mail_service import send_message


@shared_task(ignore_result=False)
def download_csv():
    service_req=ServiceRequest.query.with_entities(ServiceRequest.request_date, ServiceRequest.status,
                                                   ServiceRequest.remarks, ServiceRequest.rating,
                                                   ServiceRequest.service_id, ServiceRequest.user_id,
                                                   ServiceRequest.professional_id
                                                   ).all()
    
    csv_output=excel.make_response_from_query_sets(service_req, ["request_date","status","remarks", "rating",
                                                                 "service_id", "user_id", "professional_id"], "csv")
    filename="test.csv"
    
    with open(filename, "wb") as f:
        f.write(csv_output.data)
    
    return filename


@shared_task(ignore_result=True)
def daily_reminder():
    print("Starting daily reminder task")
    
    reqs = ServiceRequest.query.all()

    for req in reqs:
        if req.status=="Requested":
            with open('./templates/daily_reminder.html', 'r') as f:
                template = Template(f.read())  

            user=req.professional.user
            send_message(user.email, "Visit pending requests", template.render(email=user.email, name=user.name))
        
        else:
            with open('./templates/daily_reminder_1.html', 'r') as f:
                template = Template(f.read()) 
            
            user=req.professional.user
            send_message(user.email, "Explore feedback", template.render(email=user.email, name=user.name))
        
    
    return f"Daily reminders sent to all professionals"



@shared_task(ignore_output=True)
def monthly_report():
    users=User.query.all()

    for user in users:
        if not user.professional_profile and user.email!="admin@gmail.com":
            id=user.id
            requests = get_customer_service_requests(id)
            data=generate_report(requests)
            with open('./templates/monthly_report.html', 'r') as f:
                template = Template(f.read())
            send_message(user.email, "Monthly Request Report",   
                        template.render(total_requests=data["total_requests"],
                                        completed_requests=data["completed_requests"],
                                        ongoing_requests=data["ongoing_requests"],
                                        rejected_requests=data["rejected_requests"],
                                        average_rating=data["average_rating"],
                                        total_completion_time=data["total_completion_time"],
                                        requests=data["requests"]))
    
    return f"Monthly reports sent to all customers"



def get_customer_service_requests(id):
    service_requests = ServiceRequest.query.filter_by(user_id=id).order_by(ServiceRequest.request_date.desc()).all()
    return service_requests



def generate_report(req):

    total_requests = len(req)
    completed_requests = sum(1 for r in req if r.status == 'Closed')
    ongoing_requests = sum(1 for r in req if r.status == 'Ongoing')
    rejected_requests = sum(1 for r in req if r.status == 'Rejected')
    average_rating = (
        sum(r.rating for r in req if r.rating > 0.1) / total_requests if total_requests > 0 else 0
    )
    total_completion_time = sum(r.completion_time for r in req if r.completion_time is not None)


    data = {
        'total_requests': total_requests,
        'completed_requests': completed_requests,
        'ongoing_requests': ongoing_requests,
        'rejected_requests': rejected_requests,
        'average_rating': round(average_rating, 2),
        'total_completion_time': total_completion_time,
        'requests': req  
    }

    return data
