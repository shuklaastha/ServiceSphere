export default {
  template: `
    <div>
      <h1 class="text-center my-4" style="color: #F9F6EE; font-family: 'Poppins', sans-serif;">Services</h1>
      <div class="container">
        <!-- Loading state -->
        <div v-if="loading" class="d-flex justify-content-center align-items-center my-4">
          <div class="spinner-border text-secondary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- No services message -->
        <div v-else-if="allservices.length === 0" class="d-flex justify-content-center align-items-center my-4">
          <div class="card p-4" style="background-color: rgba(255, 255, 255, 0.6); width: 50%; border-radius: 10px;">
            <p class="text-center" style="color: #333; font-family: 'Poppins', sans-serif; font-size: 18px; font-style: oblique;">
              No services added, click on "Create Service" button in navigation bar to add services.
            </p>
          </div>
        </div>

        <!-- Services list -->
        <div v-else class="row g-4">
          <div v-for="service in allservices" :key="service.id" class="col-md-4">
            <div class="card h-100" style="background-color: rgba(255, 255, 255, 0.6);">
              <div class="card-body text-center">
                <p class="card-title"><strong>Name: {{ service.name }}</strong></p>
                <p class="card-text"><strong>Description</strong>: {{ service.description }}</p>
                <p class="card-text"><strong>Base Price</strong>: ₹{{ service.base_price }}<br> <strong>Time Required</strong>: {{ service.time_required }} minutes</p>
                <router-link
                  v-if="role === 'admin'"
                  :to="{ name: 'EditService', params: { id: service.id }, query: service }"
                  class="btn btn-warning">
                  Edit
                </router-link>
                <button
                  v-if="role === 'admin'"
                  type="button"
                  class="btn btn-dark"
                  @click="confirmDelete(service.id)">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>


        <!-- Service Requests Table -->
        <h2 class="text-center mt-5" style="color: #F9F6EE; font-family: 'Poppins', sans-serif;">Service Requests</h2>
        <div v-if="loadingRequests" class="d-flex justify-content-center align-items-center my-4">
          <div class="spinner-border text-secondary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        

      <div v-if="serviceRequests.length === 0" class="d-flex justify-content-center align-items-center my-4">
          <div class="card" style="background: rgba(255, 255, 255, 0.6); padding: 20px; border-radius: 10px;">
            <div class="card-body text-center">
              <p class="mb-0" style="color: #333;">No service requests found, wait for users to book services.</p>
            </div>
          </div>
        </div>

        <div v-else>
        <div class="d-flex justify-content-center mt-4">
          <button 
              class="btn btn-dark" 
              @click="downloadServiceRequests">
              Download Data
          </button>
          </div>
            <div v-if="waiting" class="d-flex justify-content-center align-items-center mt-4">
              <div class="p-4 text-center" style="
              background-color: rgba(255, 255, 255, 0.8);
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              width: 60%;
            ">
              <p style="color: #333; font-family: 'Poppins', sans-serif; font-size: 16px;">
                Service request data is being prepared for download...
              </p>
          </div>
        </div>
        </div>
        <div class="table-responsive">
          <table class="table table-striped" style="background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(8px); border-radius: 10px;">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Service</th>
                <th>Requested By</th>
                <th>Customer contact</th>
                <th>Professional</th>
                <th>Professional contact</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Rating</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in serviceRequests" :key="request.id">
                <td>{{ request.id }}</td>
                <td>{{ request.service.name }}</td>
                <td>{{ request.user.name }} </td>
                <td>{{ request.user.phone }} <br>
                    {{ request.user.email }}</td>
                <td>{{ request.professional.name }}</td>
                <td>{{ request.professional.phone}}<br>
                    {{ request.professional.email}}</td>
                <td>{{ request.status }}</td>
                <td>{{ request.remarks || 'N/A' }}</td>
                <td>{{ request.rating === 0.1 ? 'N/A' : request.rating }}</td>
                <td>{{ formatDate(request.request_date) }}</td>
                <td>
                  <button
                    v-if="role === 'admin'"
                    class="btn btn-dark"
                    @click="confirmDeleteRequest(request.id)">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  `,
  data() {
    return {
      allservices: [],
      serviceRequests: [],
      loading: true,
      loadingRequests: true,
      waiting:false,
      token: localStorage.getItem("auth-token"),
      role: localStorage.getItem("role"),
      name:localStorage.getItem("name")
    };
  },async mounted() {
    try {
      console.log("Fetching services...");
      const res = await fetch('/api/services', {
        headers: { 'Authentication-token': this.token },
      });
      console.log("Service fetch response:", res);
  
      if (res.ok) {
        const data = await res.json();
        console.log("Fetched services:", data);
        this.allservices = data;
      } else {
        console.error("Failed to fetch services:", res.status, await res.text());
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      console.log("Services loading finished");
      this.loading = false;
    }
  
    try {
      console.log("Fetching service requests...");
      const resRequests = await fetch('/api/admin_service_requests', {
        headers: { 'Authentication-token': this.token },
      });
      console.log("Service requests fetch response:", resRequests);
  
      if (resRequests.ok) {
        const requestsData = await resRequests.json();
        console.log("Fetched service requests:", requestsData);
        this.serviceRequests = requestsData;
      } else {
        console.error(
          "Failed to fetch service requests:",
          resRequests.status,
          await resRequests.text()
        );
      }
    } catch (error) {
      console.error("Error fetching service requests:", error);
    } finally {
      console.log("Service requests loading finished");
      this.loadingRequests = false;
    }
  
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
    async deleteRequest(id) {
      try {
        const res = await fetch('/api/admin_service_requests', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-token': this.token,
          },
          body:JSON.stringify({id})
        });
        if (res.ok) {
          alert("Request deleted successfully");
          window.location.reload();
        } else {
          alert("Failed to delete request");
        }
      } catch (error) {
        console.error("Error deleting request:", error);
        alert("Error deleting request");
      }
    },
    confirmDeleteRequest(requestId) {
      if (window.confirm("Are you sure you want to delete this service request?")) {
        this.deleteRequest(requestId);
      }
    },
    async Delete(id) {
      try {
        const res = await fetch('/api/services', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-token': this.token,
          },
          body: JSON.stringify({ id }),
        });

        const data = await res.json();
        if (res.ok) {
          alert("Service deleted successfully");
          this.allservices = this.allservices.filter(service => service.id !== id);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error("Error deleting service:", error);
        alert("Failed to delete service");
      }
    },
    confirmDelete(id) {
      if (window.confirm("Are you sure you want to delete this service?")) {
        this.Delete(id);
      }
    },
    async downloadServiceRequests(){
            this.waiting=true
            const res= await fetch('/download-csv')
            const data= await res.json()
            if(res.ok){
              const task_id=data["task_id"]
              const interval = setInterval(async() => {
                const down = await fetch(`/get-csv/${task_id}`)
                if (down.ok){
                  this.waiting=false
                  clearInterval(interval)
                  window.location.href = `/get-csv/${task_id}`
                }
              }, 1000);
            }
    },
  },
  }