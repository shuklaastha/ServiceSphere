export default {
    template: `
      <div class="registration-page d-flex align-items-center justify-content-center vh-100">
        <div class="form-card p-5 shadow" style="background-color: rgba(255, 255, 255, 0.8); border-radius: 15px; width: 500px;">
          <h1 class="text-center mb-4" style="color: #333; font-family: 'Poppins', sans-serif;">User Registration</h1>
          <form @submit.prevent="registerUser">
            <div class="form-group mb-3">
              <label for="name" class="form-label" style="font-weight: 500;">Name</label>
              <input
                v-model="user.name"
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
                v-model="user.email"
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
                v-model="user.password"
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
                v-model="user.phone"
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
                v-model="user.address"
                id="address"
                class="form-control"
                rows="3"
                placeholder="Enter your address"
                style="border-radius: 10px;"
                required
              ></textarea>
            </div>
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
        user: {
          name: "",
          email: "",
          password: "",
          phone: "",
          address: "",
          roles:  ["customer"],
        },
      };
    },
    methods: {
      async registerUser() {
        try {
          const response = await fetch("/api/register_user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.user),
          });
          if (response.ok) {
            alert("User registered successfully!");
            this.$router.push("/login");
          } else {
            alert("Failed to register user!");
          }
        } catch (error) {
          console.error("Error:", error);
          alert("An error occurred during registration.");
        }
      },
    },
  };
  