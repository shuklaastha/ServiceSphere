
# ServiceSphere

### Description 
Introducing ServiceSphere – a Household services App, a lightweight service booking app  designed for people to book services easily. With it you can easily explore and enjoy various  services from trained and verified professionals. The app also lets you rate and add remarks  the services you avail for to improve the service quality.  You can register as a user who wants to avail services or as a professional who will appear  on the platform.  Designed to be user-friendly, It offers a seamless experience for both users and  professionals with constant feedback and monitoring by admin. 

### Technologies Used 
The application harnesses Flask, a potent web framework, for backend development. Key  Flask extensions like Flask-Security for user authentication and Flask-SQLAlchemy for  database management are seamlessly integrated. For frontend development, VueJS is  employed, leveraging CDN for efficient resource loading, while Bootstrap enhances visual  aesthetics. Vue-router ensures smooth navigation, while Pinia effectively manages state.  Performance optimization is achieved through Redis for caching, supplemented by  Flask-Caching. flask_mail facilitates email sending, while flask_cors enables cross-origin  resource sharing. HTTP requests are managed using the 'requests' library. Additionally,  Redis combined with Celery streamlines batch job handling. 

### API Design 
 The Flask-based API architecture is organized for efficient functionality management through  distinct endpoints. The  Services API  handles operations  like adding, updating, and retrieving  service information. The  Users API  manages user creation  and retrieval, emphasizing  role-specific actions. The  Service Request API  supports  handling service request creation,  updates, and administration. The  Professionals API  focuses on managing professional  profiles and their availability. The  Admin Summary  API  aggregates system statistics for  admins, while  User and Professional Summary APIs  provide  personalized insights. Using  Flask-RESTful, Flask-SQLAlchemy, and caching, the architecture ensures streamlined  interactions and robust data handling in the service management platform. 

### db Schema Design 
The database model for the service management system includes tables for User, Role,  User_Roles, Professional, Service, and Service_Request. Users are linked to roles through  User_Roles, while professionals are associated with users and offer services. Services  store details like name, description, price, and time. Service_Request tracks user requests,  including status, remarks, and ratings.  The schema links users, roles, professionals, services, and requests, enabling efficient 



## 🛠 Skills
Python, Flask, Sqlite, Redis, Celery, Vue.js


## Run Locally

Clone the project

```bash
  git clone https://link-to-project
```

Go to the project directory

```bash
  cd ServiceSphere
```

Create and activate virtual environment
```poweshell
    python -m venv virtual
    cd virtual
    .\Scripts\activate
```

Install dependencies
```powershell
pip install -r requirements.txt
```

Start the application

```bash
flask run
```

start Redis server:
```
sudo service redis-server start
```

start mailhog:
```
cd application
./MailHog_linux_amd64
```

Start the celery worker 

```bash
celery -A app:celery_app worker --loglevel=INFO --pool=solo
```

Start the celery queue (celery beat):

```
celery -A app:celery_app beat --loglevel=INFO
```



