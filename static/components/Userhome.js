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
              No services added, wait for services to be added to application.
            </p>
          </div>
        </div>

        <!-- Services list -->
        <div v-else class="row g-4">
          <div v-for="service in allservices" :key="service.id" class="col-md-4">
            <div class="card h-100" style="background-color: rgba(255, 255, 255, 0.6);">
              <div class="card-body text-center">
                <p class="card-title"><strong>Service: {{ formatname(service.name) }}</strong></p>
                <p class="card-text"><strong>Description</strong>: {{ service.description }}</p>
                <p class="card-text"><strong>Base Price</strong>: ₹{{ service.base_price }}<br> 
                <strong>Time Required</strong>: {{ service.time_required }} minutes <br>
                <strong>Rating</strong>: {{ service.average_rating }}/5</p>
                <router-link
                  v-if="role === 'customer'"
                  :to="{ name: 'ServiceCard', params: { id: service.id, completion_time: service.time_required } }"
                  class="btn btn-dark">
                  Explore
                </router-link>
                <!-- Conditional rendering for new professional -->
                <div v-if="!service.average_rating" class="text-muted" style="font-size: 14px;">
                  This service is recently added to the platform, hence it is not rated. Try out this services!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- User Service Requests -->
      <h2 class="text-center mt-5" style="color: #F9F6EE; font-family: 'Poppins', sans-serif;">My Service Requests</h2>
      <div class="container mt-4">
        <!-- Loading spinner -->
        <div v-if="loadingUserRequests" class="d-flex justify-content-center align-items-center my-4">
          <div class="spinner-border text-secondary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- No user service requests -->
        <div v-else-if="userServices.length === 0" class="d-flex justify-content-center align-items-center my-4">
          <div class="card" style="background: rgba(255, 255, 255, 0.6); padding: 20px; border-radius: 10px;">
            <div class="card-body text-center">
              <p class="mb-0" style="color: #333;">No service requests found, book a service and enjoy!</p>
            </div>
          </div>
        </div>

        <!-- User services table -->
        <div v-else class="table-responsive">
          <table class="table table-striped" style="background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(8px); border-radius: 10px;">
            <thead>
              <tr>
                <th>Service</th>
                <th>Professional</th>
                <th>Date</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in userServices" :key="request.id">
                <td>{{ request.service.name }}</td>
                <td>{{ request.professional?.name || "Not Assigned" }}</td>
                <td>{{ formatDate(request.request_date) }}</td>
                <td>{{ request.status }}</td>
                <td>{{ request.remarks || "N/A" }}</td>
                <td>
                  <router-link 
                  v-if="request.status === 'Ongoing'" 
                  class="btn btn-warning" 
                  :to="{ name: 'Close_service', params: { id: request.id } }">
                  Close
                  </router-link>
                  <span v-else>{{request.status}}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      allservices: [],
      userServices: [],
      loading: true,
      loadingUserRequests: true,
      role: localStorage.getItem("role"),
      token: localStorage.getItem("auth-token"),
      userId: localStorage.getItem("user_id"),
    };
  },
  async mounted() {
    try {
      const servicesResponse = await fetch('/api/services', {
        headers: { 'Authentication-token': this.token },
      });
      if (!servicesResponse.ok) throw new Error(`Error fetching services: ${servicesResponse.status}`);
      this.allservices = await servicesResponse.json();

      const requestsResponse = await fetch(`/api/service_req_user/${this.userId}`, {
        headers: { 'Authentication-token': this.token },
      });
      if (!requestsResponse.ok) throw new Error(`Error fetching user requests: ${requestsResponse.status}`);
      this.userServices = await requestsResponse.json();

    } catch (error) {
      console.error("Error in mounted lifecycle:", error);
    } finally {
      this.loading = false;
      this.loadingUserRequests = false;
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },

    formatname(name){
      const newname=name.toUpperCase();
      return newname;
    },
    async closeService(requestId) {
      try {
        const res = await fetch(`/api/service_req_user/${requestId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authentication-token": this.token,
          },
          body: JSON.stringify({ status: "closed" }),
        });
        if (!res.ok) throw new Error("Failed to close service");
        this.userServices = this.userServices.map(request =>
          request.id === requestId ? { ...request, status: "closed" } : request
        );
        alert("Service closed successfully.");
      } catch (error) {
        console.error("Error closing service:", error);
        alert("Failed to close service.");
      }
    },
  },
};
