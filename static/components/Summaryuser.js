export default {
    template: `
      <div 
        class="d-flex justify-content-center align-items-center" 
        style="height: 75vh;">
        <div class="container d-flex flex-wrap justify-content-center">
          <!-- Ongoing Card -->
          <div 
            class="card text-center mx-3 my-3 shadow-sm"
            style="width: 18rem; background: rgba(255, 255, 255, 0.9); border-radius: 10px;">
            <div class="card-body">
              <h3 class="card-title" style="font-style: oblique;">Ongoing</h3>
              <h2 style="font-style: oblique;">{{ ongoing }}</h2>
              <p class="small text-muted" style="font-style: oblique;">Currently active services</p>
            </div>
          </div>
      
          <!-- Requested Card -->
          <div 
            class="card text-center mx-3 my-3 shadow-sm"
            style="width: 18rem; background: rgba(255, 255, 255, 0.9); border-radius: 10px;">
            <div class="card-body">
              <h3 class="card-title" style="font-style: oblique;">Requested</h3>
              <h2 style="font-style: oblique;">{{ requested }}</h2>
              <p class="small text-muted" style="font-style: oblique;">Pending approval</p>
            </div>
          </div>
      
          <!-- Rejected Card -->
          <div 
            class="card text-center mx-3 my-3 shadow-sm"
            style="width: 18rem; background: rgba(255, 255, 255, 0.9); border-radius: 10px;">
            <div class="card-body">
              <h3 class="card-title" style="font-style: oblique;">Rejected</h3>
              <h2 style="font-style: oblique;">{{ rejected }}</h2>
              <p class="small text-muted" style="font-style: oblique;">Services not approved</p>
            </div>
          </div>
      
          <!-- Closed Card -->
          <div 
            class="card text-center mx-3 my-3 shadow-sm"
            style="width: 18rem; background: rgba(255, 255, 255, 0.9); border-radius: 10px;">
            <div class="card-body">
              <h3 class="card-title" style="font-style: oblique;">Closed</h3>
              <h2 style="font-style: oblique;">{{ closed }}</h2>
              <p class="small text-muted" style="font-style: oblique;">Completed services</p>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        role: localStorage.getItem("role"),
        token: localStorage.getItem("auth-token"),
        userId: localStorage.getItem("user_id"),
        ongoing: 0,
        requested: 0,
        rejected: 0,
        closed: 0,
      };
    },
    async mounted() {
      try {
        const res = await fetch(`/api/summary-user?user_id=${this.userId}`, {
          headers: {
            "Authentication-token": this.token,
          },
        });
        if (res.ok) {
          const data = await res.json();
          this.ongoing = data.ongoing;
          this.requested = data.requested;
          this.rejected = data.rejected;
          this.closed = data.closed;
        } else {
          console.error("Failed to fetch data: ", await res.text());
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    },
  };
  