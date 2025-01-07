export default {
  template: `
    <div>
      <h1 class="text-center my-4" style="color: #F9F6EE; font-family: 'Poppins', sans-serif; font-style: oblique">Professionals</h1>
      <div class="container">
        <!-- Loading state -->
        <div v-if="loading" class="d-flex justify-content-center align-items-center my-4">
          <div class="spinner-border text-secondary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- No professionals available message -->
        <div v-else-if="allprof.length === 0" class="d-flex justify-content-center align-items-center my-4">
          <div class="card p-4" style="background-color: rgba(255, 255, 255, 0.6); width: 50%; border-radius: 10px;">
            <p class="text-center" style="color: #333; font-family: 'Poppins', sans-serif; font-size: 18px; font-style: oblique;">
              No professionals available for this service. Please wait for a while.
            </p>
          </div>
        </div>

        <!-- Professionals list -->
        <div v-else class="row g-4">
          <div v-for="prof in allprof" :key="prof.id" class="col-md-4">
            <div class="card h-100" style="background-color: rgba(255, 255, 255, 0.6);">
              <div class="card-body text-center">
                <p class="card-title"><strong>Name: </strong> {{ prof.name }}</p>
                <p class="card-text"><strong>Phone no: </strong> {{ prof.phone }}</p>
                <p class="card-text"><strong>Service Type:</strong> {{ prof.service_type }}</p>
                <p class="card-text"><strong>Experience:</strong> {{ prof.experience }} years<br>
                <strong>Rating:</strong> {{ prof.average_rating }}/5</p>
                <button
                  type="button"
                  class="btn btn-dark"
                  @click="confirmbook(prof.id)">
                  Book
                </button>
                <!-- Conditional rendering for new professional -->
                <div v-if="!prof.average_rating" class="text-muted" style="font-size: 14px;">
                  This professional is new to the platform, hence not rated. Try out their services!
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      allprof: [],
      loading: true,
      token: localStorage.getItem("auth-token"),
      serviceId: this.$route.params.id,
      completion_time: this.$route.params.completion_time
    };
  },
  async mounted() {
    try {
      const res = await fetch(`/api/professionals?service_id=${this.serviceId}`, {
        headers: {
          "Authentication-token": this.token,
        },
      });
      const data = await res.json();

      if (res.ok) {
        this.allprof = data;
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching professionals:", error);
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
            service_id: this.serviceId,
            user_id: localStorage.getItem('user_id'),
            completion_time: this.completion_time,
            status: 'Requested',
          }),
        });

        const data = await res.json();

        if (res.ok) {
          
          alert('Booking successful');
          
          this.$router.push('/')
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error('Error booking professional:', error);
      } finally {
        this.loading = false; 
      }
    },
    confirmbook(prof_id){
      if( window.confirm("Do you want to book this service?")){
        this.book(prof_id);
      }
    }
  },
};
