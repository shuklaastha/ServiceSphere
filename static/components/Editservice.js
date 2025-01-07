export default {
    template:`
    <div>
      <div class="container d-flex justify-content-center align-items-center min-vh-100">
        <div class="card p-4 shadow-lg" style="max-width: 500px; width: 100%; background-color: rgba(255, 255, 255, 0.8); border-radius: 10px;">
          <div class='text-danger mb-2'>*{{ error }}</div>
          <h2 class="text-center mb-4">Edit Service</h2>
          <div class="mb-3">
            <label for="serviceName" class="form-label">Name</label>
            <input type="text" class="form-control" id="serviceName" :placeholder="service.name || 'Cleaning'" required v-model="service_.name">
          </div>
          <div class="mb-3">
            <label for="serviceDescription" class="form-label">Description of the service</label>
            <input type="text" id="serviceDescription" class="form-control" :placeholder="service.description || 'Description...'" required v-model="service_.description">
          </div>
          <div class="mb-3">
            <label for="serviceBasePrice" class="form-label">Base Price</label>
            <input type="text" class="form-control" id="serviceBasePrice" :placeholder="service.base_price || 'e.g., 200'" required v-model="service_.base_price">
            <small class="text-muted">Enter base price of service in rupees</small>
          </div>
          <div class="mb-3">
            <label for="serviceTimeRequired" class="form-label">Time Required</label>
            <input type="text" class="form-control" id="serviceTimeRequired" :placeholder="service.time_required || 'e.g., 20'" required v-model="service_.time_required">
            <small class="text-muted">Enter time required for the service in minutes</small>
          </div>
          <div class="d-flex justify-content-center">
            <button type="submit" class="btn btn-dark w-100 submit-btn" @click="EditService">Submit</button>
          </div>
        </div>
      </div>
    </div>`,

  
    props: {
        id: {
          type: String,
          required: true,
        },
        service: {
          type: Object,
          default: () => ({}), // Provide default in case of empty query
        },
      },
      data() {
        return {
          service_: {
            id: this.service.id || null,
            name: this.service.name || "",
            description: this.service.description || "",
            base_price: this.service.base_price || null,
            time_required: this.service.time_required || null,
          },
          token: localStorage.getItem("auth-token"),
          error: "",
        };
      },
      async mounted() {
        if (!this.service.name) {
          try {
            const res = await fetch(`/api/services?id=${this.id}`, {
              headers: {
                "Authentication-token": this.token,
              },
            });
            const data = await res.json();
            if (res.ok) {
              this.service_ = data;
            } else {
              this.error = data.message || "Failed to fetch service details.";
            }
          } catch (error) {
            console.error("Error fetching service details:", error);
            this.error = "An error occurred while fetching service details.";
          }
        }
      },
      methods: {
        async EditService() {
          try {
            const res = await fetch("/api/services", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "Authentication-token": this.token,
              },
              body: JSON.stringify(this.service_),
            });
            const data = await res.json();
            if (res.ok) {
              alert("Service updated successfully.");
              this.$router.push("/");
              window.location.reload();
            } else {
              this.error = data.message || "Failed to update the service.";
            }
          } catch (error) {
            console.error("Error updating service:", error);
            this.error = "An error occurred while updating the service.";
          }
        },
      },
    };

  
  