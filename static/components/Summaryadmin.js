export default {
    template: `
      <div class="container my-5 d-flex flex-wrap justify-content-center" style="font-style:oblique">
        <!-- Card Template -->
        <div 
          class="card text-center mx-3 my-3 shadow-sm align-self-stretch"
          style="width: 18rem; background: rgba(255, 255, 255, 0.9); border-radius: 10px;">
          <div class="card-body">
            <h3 class="card-title">Total Users</h3>
            <p class="card-text text-muted">The total number of users registered on the platform.</p>
            <h2>{{ user_count }}</h2>
          </div>
        </div>
          
        <div 
          class="card text-center mx-3 my-3 shadow-sm align-self-stretch"
          style="width: 18rem; background: rgba(255, 255, 255, 0.9); border-radius: 10px;">
          <div class="card-body">
            <h3 class="card-title">Customers</h3>
            <p class="card-text text-muted">Users availing services as customers.</p>
            <h2>{{ customers }}</h2>
          </div>
        </div>
  
        <div 
          class="card text-center mx-3 my-3 shadow-sm align-self-stretch"
          style="width: 18rem; background: rgba(255, 255, 255, 0.9); border-radius: 10px;">
          <div class="card-body">
            <h3 class="card-title">Professionals</h3>
            <p class="card-text text-muted">Users offering services as professionals.</p>
            <h2>{{ prof_count }}</h2>
          </div>
        </div>
  
        <div 
          class="card text-center mx-3 my-3 shadow-sm align-self-stretch"
          style="width: 18rem; background: rgba(255, 255, 255, 0.9); border-radius: 10px;">
          <div class="card-body">
            <h3 class="card-title">Services</h3>
            <p class="card-text text-muted">The number of services listed on the platform.</p>
            <h2>{{ services }}</h2>
          </div>
        </div>
  
        <div 
          class="card text-center mx-3 my-3 shadow-sm align-self-stretch"
          style="width: 18rem; background: rgba(255, 255, 255, 0.9); border-radius: 10px;">
          <div class="card-body">
            <h3 class="card-title">Service Requests</h3>
            <p class="card-text text-muted">Requests made for various services.</p>
            <h2>{{ service_requests }}</h2>
          </div>
        </div>
  
        <div 
          class="card text-center mx-3 my-3 shadow-sm align-self-stretch"
          style="width: 18rem; background: rgba(255, 255, 255, 0.9); border-radius: 10px;">
          <div class="card-body">
            <h3 class="card-title">Average Rating</h3>
            <p class="card-text text-muted">The average user rating for services.</p>
            <h2>{{ avg_rating }}</h2>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        token: localStorage.getItem("auth-token"),
        role: localStorage.getItem("role"),
        name: localStorage.getItem("name"),
        user_count: 0,
        prof_count: 0,
        services: 0,
        service_requests: 0,
        customers: 0,
        avg_rating: 0.0,
      };
    },
    async mounted() {
      try {
        const res = await fetch('/api/summary-admin', {
          headers: { 'Authentication-token': this.token },
        });
        if (res.ok) {
          const data = await res.json();
          this.user_count = data.user_count;
          this.prof_count = data.prof_count;
          this.services = data.service_count;
          this.service_requests = data.service_request_count;
          this.avg_rating = data.average_rating;
          this.customers = this.user_count - this.prof_count;
        } else {
          console.error("Failed to fetch summary data.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
  };
  