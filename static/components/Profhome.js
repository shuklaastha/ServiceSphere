export default {
    template: `
      <div>
        <div class="container">
          <!-- Loading spinner -->
          <div v-if="loading" class="d-flex justify-content-center align-items-center my-4">
            <div class="spinner-border text-secondary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
    
          <!-- No pending requests -->
          <div v-else-if="pendingRequests.length === 0 && previousServices.length === 0" class="d-flex justify-content-center align-items-center my-4">
            <div class="card" style="background: rgba(255, 255, 255, 0.6); padding: 20px; border-radius: 10px;">
              <div class="card-body text-center">
                <p class="mb-0">No Service requests available at the moment.</p>
              </div>
            </div>
          </div>
    
          <!-- Available requests -->
          <div v-else>
            <!-- Pending Requests Table -->
            <div class="table-responsive mb-5" style="background: rgba(255, 255, 255, 0.6); padding: 20px; border-radius: 10px;">
              <h3 class="mb-4 text-center">Available Requests</h3>
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Customer</th>
                    <th>Customer Phone</th>
                    <th>Address</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="request in pendingRequests" :key="request.id">
                    <td>{{ request.service.name }}</td>
                    <td>{{ request.customer.name }}</td>
                    <td>{{ request.customer.phone }}</td>
                    <td>{{ request.customer.address }}</td>
                    <td>{{ formatDate(request.request_date) }}</td>
                    <td>
                      <button 
                        class="btn btn-warning"
                        @click="confirmaccept(request.id)">
                        Accept
                      </button>
                      <button 
                        class="btn btn-dark"
                        @click="confirmreject(request.id)">
                        Reject
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
    
            <!-- Previous Services Table -->
            <div class="table-responsive" style="background: rgba(255, 255, 255, 0.6); padding: 20px; border-radius: 10px;">
              <h3 class="mb-4 text-center">Previous Service Data</h3>
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Customer</th>
                    <th>Customer Phone</th>
                    <th>Address</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Rating</th>
                    </tr>
                </thead>
                <tbody>
                  <tr v-for="service in previousServices" :key="service.id">
                    <td>{{ service.service.name }}</td>
                    <td>{{ service.customer.name }}</td>
                    <td>{{ service.customer.phone }}</td>
                    <td>{{ service.customer.address }}</td>
                    <td>{{ formatDate(service.request_date) }}</td>
                    <td>{{ service.status }}</td>
                    <td>
                      {{ service.status === 'Closed' ? service.remarks : 'N/A' }}
                    </td>
                    <td>
                      {{ service.status === 'Closed' ? service.rating : 'N/A' }}
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
        pendingRequests: [], // Holds requests with status 'requested'
        previousServices: [], // Holds services with other statuses
        loading: true,
        token: localStorage.getItem("auth-token"),
        role: localStorage.getItem("role"),
        prof_id: localStorage.getItem("prof_id"),
        user_id: localStorage.getItem("user_id"),
      };
    },
    async mounted() {
      try {
        const res = await fetch(`/api/service_requests/${this.prof_id}`, {
          headers: {
            'Authentication-token': this.token,
          },
        });
  
        if (res.ok) {
          const data = await res.json();
          this.pendingRequests = data.filter(req => req.status === 'Requested');
          this.previousServices = data.filter(req => req.status !== 'Requested');
        } else {
          const errorText = await res.text();
          console.error(`Error fetching service requests: ${res.statusText}`, errorText);
        }
      } catch (error) {
        console.error("Error fetching service requests:", error);
      } finally {
        this.loading = false;
      }
    },
    methods: {
      formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
      },
      confirmaccept(id) {
        if (confirm("Are you sure you want to accept this request?")) {
          this.accept(id);
        }
      },
      confirmreject(id) {
        if (confirm("Are you sure you want to reject this request?")) {
          this.reject(id);
        }
      },
      async accept(id) {
        try {
          const res = await fetch(`/api/service_prof/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-token': this.token,
            },
            body: JSON.stringify({ status: 'Ongoing' }),
          });
  
          const data = await res.json();
          if (res.ok) {
            alert(data.message);
            window.location.reload();
          } else {
            alert(data.message);
          }
        } catch (error) {
          console.error("Error accepting request:", error);
        }
      },
      async reject(id) {
        try {
          const res = await fetch(`/api/service_prof/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-token': this.token,
            },
            body: JSON.stringify({ status: 'Rejected' }),
          });
  
          const data = await res.json();
          if (res.ok) {
            alert(data.message);
            window.location.reload();
          } else {
            alert(data.message);
          }
        } catch (error) {
          console.error("Error rejecting request:", error);
        }
      },
    },
  };
  