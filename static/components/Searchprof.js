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
          <div v-else-if="pending.length === 0 && done.length === 0" class="d-flex justify-content-center align-items-center my-4">
            <div class="card" style="background: rgba(255, 255, 255, 0.6); padding: 20px; border-radius: 10px;">
              <div class="card-body text-center">
                <p class="mb-0">No service requests available at the moment.</p>
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
                  <tr v-for="request in pending" :key="request.id">
                    <td>{{ request.service_type }}</td>
                    <td>{{ request.customer_name }}</td>
                    <td>{{ request.customer_phone }}</td>
                    <td>{{ request.address }}</td>
                    <td>{{ formatDate(request.request_date) }}</td>
                    <td>
                      <button 
                        class="btn btn-warning"
                        @click="confirmAccept(request.id)">
                        Accept
                      </button>
                      <button 
                        class="btn btn-dark"
                        @click="confirmReject(request.id)">
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
                  <tr v-for="service in done" :key="service.id">
                    <td>{{ service.service_type }}</td>
                    <td>{{ service.customer_name }}</td>
                    <td>{{ service.customer_phone }}</td>
                    <td>{{ service.address }}</td>
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
        pending: [],
        done: [],
        loading: true,
        token: localStorage.getItem("auth-token"),
        query: this.$route.params.query || "",
        prof_id: this.$route.params.prof_id || "",
      };
    },
    async mounted() {
      try {
        const res = await fetch(`/search-professional?query=${encodeURIComponent(this.query)}&prof_id=${this.prof_id}`, {
          headers: {
            'Authentication-token': this.token,
          },
        });
  
        if (res.ok) {
          const data = await res.json();
          this.pending = data.pending;
          this.done = data.done;
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
      confirmAccept(id) {
        if (confirm("Are you sure you want to accept this request?")) {
          this.acceptRequest(id);
        }
      },
      confirmReject(id) {
        if (confirm("Are you sure you want to reject this request?")) {
          this.rejectRequest(id);
        }
      },
      async acceptRequest(id) {
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
      async rejectRequest(id) {
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
  