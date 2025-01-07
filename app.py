from flask import Flask
from application.models import *
from config import DevelopmentConfig
from flask_security import Security
from celery.schedules import crontab
from application.sec import datastore 
from application.resources import api
from application.tasks import daily_reminder, monthly_report
from application.worker import celery_init_app
from celery.schedules import crontab
from application.instances import cache
import flask_excel as excel


def create_app():
    app=Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    excel.init_excel(app)
    cache.init_app(app)
    app.security=Security(app, datastore)
    with app.app_context():
        from application import views
    return app

app= create_app()
celery_app=celery_init_app(app)

@celery_app.on_after_configure.connect

def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=16, minute=30),
        daily_reminder.s(),
        name="Daily Reminder at 4:30 PM"
    )


    sender.add_periodic_task(
        crontab(hour=20, minute=00, day_of_month=1),
        monthly_report.s(),
        name="Monthly Report on the 1st of each month"
    )
if __name__ == "__main__":
    app.run(debug=True)


    