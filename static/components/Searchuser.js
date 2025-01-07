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
          <div v-else-if="services.length === 0" class="d-flex justify-content-center align-items-center my-4">
            <div class="card p-4" style="background-color: rgba(255, 255, 255, 0.6); width: 50%; border-radius: 10px;">
              <p class="text-center" style="color: #333; font-family: 'Poppins', sans-serif; font-size: 18px; font-style: oblique;">
                No services available with this data. Please click on Home to explore services.
              </p>
            </div>
          </div>
  
          <!-- Services list -->
          <div v-else class="row g-4">
            <div v-for="service in services" :key="service.id" class="col-md-4">
              <div class="card h-100" style="background-color: rgba(255, 255, 255, 0.6);">
                <div class="card-body text-center">
                  <p class="card-title"><strong>Service: {{ service.name }}</strong></p>
                  <p class="card-text"><strong>Description</strong>: {{ service.description }}</p>
                  <p class="card-text">
                    <strong>Base Price</strong>: ₹{{ service.base_price }}<br>
                    <strong>Time Required</strong>: {{ service.time_required }} minutes
                  </p>
                 <router-link
                  v-if="role === 'customer'"
                  :to="{ name: 'ServiceCard', params: { id: service.id, completion_time: service.time_required } }"
                  class="btn btn-dark">
                  View professionals
                </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Professionals Section -->
        <h2 v-if="professionals.length > 0" class="text-center my-4" style="color: #F9F6EE; font-family: 'Poppins', sans-serif;">Professionals</h2>
        <div v-if="professionals.length > 0" class="container">
          <div class="row g-4">
            <div v-for="prof in professionals" :key="prof.id" class="col-md-4">
              <div class="card h-100" style="background-color: rgba(255, 255, 255, 0.6);">
                <div class="card-body text-center">
                  <p class="card-title"><strong>Name: </strong> {{ prof.name }}</p>
                  <p class="card-text"><strong>Phone no: </strong> {{ prof.phone }}</p>
                  <p class="card-text"><strong>Service Type:</strong> {{ prof.service_type }}</p>
                  <p class="card-text"><strong>Experience:</strong> {{ prof.experience }} years</p>
                  <button
                    type="button"
                    class="btn btn-dark"
                    @click="confirmbook(prof.id)">
                    Book 
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        services: [],
        professionals: [],
        loading: true,
        role: localStorage.getItem("role"),
        token: localStorage.getItem("auth-token"),
      };
    },
    async mounted() {
      const query = this.$route.params.query;
      try {
        const response = await fetch(`/search-user?query=${encodeURIComponent(query)}`, {
          headers: {
            "Authentication-token": this.token,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch services.");
        const data = await response.json();
        this.services = data.services;
        this.professionals= data.professionals;
      } catch (error) {
        console.error(error);
        this.services = [];
      } finally {
        this.loading = false;
      }
    },
    methods: {

      async book(prof_id) {
        this.loading = true;
        try {
          const res = await fetch('/api/service_requests', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-token': this.token,
            },
            body: JSON.stringify({
              professional_id: prof_id,
              service_id: this.services.id,
              user_id: localStorage.getItem('user_id'),
              status: 'requested',
            }),
          });
  
          const data = await res.json();
  
          if (res.ok) {
            alert('Booking successful');
            this.$router.push('/');
          } else {
            console.error(data.message);
          }
        } catch (error) {
          console.error('Error booking professional:', error);
        } finally {
          this.loading = false;
        }
      },
      confirmbook(prof_id) {
        if (window.confirm("Do you want to book this service?")) {
          this.book(prof_id);
        }
      },
    },
  };
  