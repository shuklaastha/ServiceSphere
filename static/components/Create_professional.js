export default {
    template: `
      <div class="registration-page d-flex align-items-center justify-content-center vh-100">
        <div class="form-card p-5 shadow" style="background-color: rgba(255, 255, 255, 0.9); border-radius: 15px; width: 700px;">
          <h1 class="text-center mb-4" style="color: #333; font-family: 'Poppins', sans-serif; font-weight: 600;">Professional Registration</h1>
          <form @submit.prevent="registerProfessional">
            
            <!-- User fields -->
            <div class="form-group mb-3">
              <label for="name" class="form-label" style="font-weight: 500;">Name</label>
              <input
                v-model="professional.name"
                type="text"
                id="name"
                class="form-control"
                placeholder="Enter your name"
                style="border-radius: 10px;"
                required
              />
            </div>
            <div class="form-group mb-3">
              <label for="email" class="form-label" style="font-weight: 500;">Email</label>
              <input
                v-model="professional.email"
                type="email"
                id="email"
                class="form-control"
                placeholder="Enter your email"
                style="border-radius: 10px;"
                required
              />
            </div>
            <div class="form-group mb-3">
              <label for="password" class="form-label" style="font-weight: 500;">Password</label>
              <input
                v-model="professional.password"
                type="password"
                id="password"
                class="form-control"
                placeholder="Enter your password"
                style="border-radius: 10px;"
                required
              />
            </div>
            <div class="form-group mb-3">
              <label for="phone" class="form-label" style="font-weight: 500;">Phone</label>
              <input
                v-model="professional.phone"
                type="text"
                id="phone"
                class="form-control"
                placeholder="Enter your phone number"
                style="border-radius: 10px;"
                required
              />
            </div>
            <div class="form-group mb-3">
              <label for="address" class="form-label" style="font-weight: 500;">Address</label>
              <textarea
                v-model="professional.address"
                id="address"
                class="form-control"
                rows="3"
                placeholder="Enter your address"
                style="border-radius: 10px;"
                required
              ></textarea>
            </div>
  
            <!-- Professional fields -->
            <div class="form-group mb-3">
              <label for="service_type" class="form-label" style="font-weight: 500;">Service Type</label>
              <input
                v-model="professional.service_type"
                type="text"
                id="service_type"
                class="form-control"
                placeholder="Enter your service type"
                style="border-radius: 10px;"
                required
              />
            </div>
            <div class="form-group mb-3">
              <label for="experience" class="form-label" style="font-weight: 500;">Experience (in years)</label>
              <input
                v-model="professional.experience"
                type="number"
                id="experience"
                class="form-control"
                placeholder="Enter your experience in years"
                style="border-radius: 10px;"
                required
              />
            </div>
            <!-- Service Category dropdown -->
            <div class="form-group mb-3">
              <label for="service_category" class="form-label" style="font-weight: 500;">Service Category</label>
              <select
                v-model="professional.service_category"
                id="service_category"
                class="form-control"
                style="border-radius: 10px;"
                required
              >
                <option v-for="service in services" :key="service.id" :value="service.id">{{ service.name }}</option>
              </select>
            </div>
  
            <!-- Submit button -->
            <button
              type="submit"
              class="btn btn-dark w-100"
              style="border-radius: 10px; font-weight: 600; font-size: 1rem;">
              Register
            </button>
          </form>
        </div>
      </div>
    `,
    data() {
      return {
        professional: {
          name: "",
          email: "",
          password: "",
          phone: "",
          address: "",
          service_type: "",
          experience: "",
          service_category: null,
          roles: ["professional"]
        },
        services: [] // This will hold the list of services
      };
    },
    created() {
      // Fetch the list of services from the Service table
      this.fetchServices();
    },
    methods: {
      async fetchServices() {
        try {
          const response = await fetch("/api/services");
          if (response.ok) {
            this.services = await response.json();
            console.log(this.services);
          } else {
            alert("Failed to fetch service categories!");
          }
        } catch (error) {
          console.error("Error fetching services:", error);
          alert("An error occurred while fetching services.");
        }
      },
      async registerProfessional() {
        try {
          const response = await fetch("/api/register_professional", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.professional),
          });
          if (response.ok) {
            alert("Professional registered successfully!");
            this.$router.push("/login");
          } else {
            alert("Failed to register professional!");
          }
        } catch (error) {
          console.error("Error:", error);
          alert("An error occurred during registration.");
        }
      },
    },
  };
  