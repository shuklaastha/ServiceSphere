export default{
    template:`
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

        <!-- Users Table -->
        <h2 class="text-center mt-5" style="color: #F9F6EE; font-family: 'Poppins', sans-serif;">Users</h2>
        <div v-if="load" class="d-flex justify-content-center align-items-center my-4">
          <div class="spinner-border text-secondary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-if="users.length === 0 || users[0].email==='admin@gmail.com'" class="d-flex justify-content-center align-items-center my-4">
          <div class="card" style="background: rgba(255, 255, 255, 0.6); padding: 20px; border-radius: 10px;">
            <div class="card-body text-center">
              <p class="mb-0" style="color: #333;">No matching user found.</p>
            </div>
          </div>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-striped" style="background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(8px); border-radius: 10px;">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Contact</th>
                <th>Active</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
             <tr v-for="user in users.filter(user => user.email !== 'admin@gmail.com')" 
            :key="user.id" 
            style="font-style: oblique;">

                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.address }}</td>
                <td>{{ user.contact }}</td>
                <td>{{ user.active ? 'Yes' : 'No' }}</td>
              <td>
                <button
                  v-if="!user.active"
                  type="button"
                  class="btn btn-dark"
                  @click="confirmActivate(user.id)"
                >
                  Activate
                </button>
                <button
                  v-if="user.active"
                  type="button"
                  class="btn btn-dark"
                  @click="confirmDeactivate(user.id)"
                >
                  Deactivate
                </button>
              </td>
              </tr>
            </tbody>
          </table>
        </div>


        <!-- Professionals Table -->
        <h2 class="text-center mt-5" style="color: #F9F6EE; font-family: 'Poppins', sans-serif;">Professionals</h2>
        <div v-if="loader" class="d-flex justify-content-center align-items-center my-4">
          <div class="spinner-border text-secondary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-if="professionals.length === 0" class="d-flex justify-content-center align-items-center my-4">
          <div class="card" style="background: rgba(255, 255, 255, 0.6); padding: 20px; border-radius: 10px;">
            <div class="card-body text-center">
              <p class="mb-0" style="color: #333;">No matching professional found.</p>
            </div>
          </div>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-striped" style="background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(8px); border-radius: 10px;">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Service Type</th>
                <th>Availability Status</th>
                <th>Experience</th>
                <th>Active</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
             <tr v-for="prof in professionals" 
            :key="prof.id" 
            style="font-style: oblique;">
                <td>{{ prof.name }}</td>
                <td>{{ prof.email }}</td>
                <td>{{ prof.service_type}}</td>
                <td>{{ prof.availability }}</td>
                <td>{{ prof.experience }} yr</td>
                <td>{{ prof.active ? 'Yes' : 'No' }}</td>
              <td>
                <button
                  v-if="!prof.active"
                  type="button"
                  class="btn btn-dark"
                  @click="confirmActivate(prof.id)"
                >
                  Activate
                </button>
                <button
                  v-if="prof.active"
                  type="button"
                  class="btn btn-dark"
                  @click="confirmDeactivate(prof.id)"
                >
                  Deactivate
                </button>
                <button
                  type="button"
                  class="btn btn-warning"
                  @click="deleteProfessional(prof.id)"
                >
                  Delete
                </button>
              </td>
              </tr>
            </tbody>
          </table>
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

        <div v-else class="table-responsive">
          <table class="table table-striped" style="background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(8px); border-radius: 10px;">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Service</th>
                <th>Requested By</th>
                <th>Customer Contact</th>
                <th>Professional</th>
                <th>Professional Contact</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Rating</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in serviceRequests" :key="request.id" style="font-style: oblique;">
                <td>{{ request.id }}</td>
                <td>{{ request.service }}</td>
                <td>{{ request.customer_name }}</td>
                <td>{{ request.customer_email }}</td>
                <td>{{ request.professional_name }}</td>
                <td>{{ request.professional_email }}</td>
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
    `,
    data() {
        return {
          allservices: [],
          serviceRequests: [],
          users:[],
          professionals:[],
          load:true,
          loading: true,
          loadingRequests: true,
          loader: true,
          token: localStorage.getItem("auth-token"),
          role: localStorage.getItem("role"),
          name:localStorage.getItem("name")
        };
      },
      async mounted() {
        const query = this.$route.params.query;
        try {
          const response = await fetch(`/admin-search?query=${encodeURIComponent(query)}`, {
            headers: {
              "Authentication-token": this.token,
            },
          });
      
          if (!response.ok) throw new Error("Failed to fetch services.");
          const data = await response.json();
          this.allservices = data.services || [];
          this.serviceRequests = data.serviceRequests || [];
          this.users = data.users || [];
          this.professionals = data.professionals || []
        } catch (error) {
          console.error("Error fetching services or service requests:", error);
        } finally {
          this.loading = false;
          this.loadingRequests = false;
          this.load=false;
          this.loader=false;
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
        confirmActivate(prof_id) {
            const confirmAction = confirm("Are you sure you want to activate this user?");
            if (confirmAction) {
              this.activate(prof_id);
            }
          },
          async activate(prof_id) {
            const res = await fetch(`/activate_professional/${prof_id}`, {
              headers: {
                'Authentication-Token': this.token,
              },
            });
            const data = await res.json();
            if (res.ok) {
              alert(data.message);
              window.location.reload();
            }
          },
      
          // Confirmation for Deactivate
          confirmDeactivate(prof_id) {
            const confirmAction = confirm("Are you sure you want to deactivate this user?");
            if (confirmAction) {
              this.deactivate(prof_id);
            }
          },
          async deactivate(prof_id) {
            const res = await fetch(`/deactivate_professional/${prof_id}`, {
              method: "POST",
              headers: {
                'Authentication-Token': this.token,
                'Content-Type': 'application/json',
              },
            });
            const data = await res.json();
            if (res.ok) {
              alert(data.message);
              window.location.reload();
            }
          },
      
          // Delete Professional
          async deleteProfessional(prof_id) {
            const confirmDelete = confirm("Are you sure you want to delete this professional?");
            if (!confirmDelete) return;
      
            const res = await fetch(`/delete_professional/${prof_id}`, {
              method: "DELETE",
              headers: {
                'Authentication-Token': this.token,
                'Content-Type': 'application/json',
              },
            });
            const data = await res.json();
            if (res.ok) {
              alert(data.message);
              window.location.reload();
            } else {
              alert(data.error || "Failed to delete professional.");
            }
          },
      },
}