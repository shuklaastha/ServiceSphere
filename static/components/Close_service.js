export default {
    template: `
      <div>
        <div class="container d-flex justify-content-center align-items-center min-vh-100">
          <div class="card p-4 shadow-lg" style="max-width: 500px; width: 100%; background-color: rgba(255, 255, 255, 0.8); border-radius: 10px;">
            <div class="text-danger mb-2">*{{error}}</div>
            <h2 class="text-center mb-4">Close Service</h2>
            
            <!-- Star Rating -->
            <div class="mb-3">
              <label class="form-label">Rating</label>
              <div class="star-rating">
                <span 
                  v-for="star in 5" 
                  :key="star" 
                  class="star" 
                  :class="{ selected: star <= cred.rating }" 
                  @click="setRating(star)"
                >
                  ★
                </span>
              </div>
            </div>
            
            <!-- Debugging: Show Selected Rating -->
            <p class="text-center">Selected Rating: {{ cred.rating }}/5</p>
  
            <!-- Remarks -->
            <div class="mb-3">
              <label for="remarksInput" class="form-label">Remarks</label>
              <textarea 
                id="remarksInput" 
                class="form-control" 
                rows="3" 
                placeholder="Enter your remarks" 
                required 
                v-model="cred.remarks"
              ></textarea>
            </div>
            
            <div class="d-flex justify-content-center">
              <button type="submit" class="btn btn-dark w-100 submit-btn" @click="submitCloseRequest">Submit</button>
            </div>
            
            <div class="text-center mt-3">
              <span>Please rate the service and leave constructive remarks for us to keep providing you better service!</span>
            </div>
          </div>
        </div>
      </div>
    `,
    style: `
      .star-rating {
        display: flex;
        justify-content: center;
        gap: 15px; /* Increased spacing between stars */
        font-size: 50px; /* Increased font size for stars */
        cursor: pointer;
      }
      .star {
        color: gray;
        transition: color 0.3s ease, transform 0.2s ease;
      }
      .star:hover,
      .star.selected {
        color: gold; /* Highlight stars on hover and when selected */
        transform: scale(1.3); /* Slightly enlarge selected/hovered stars */
      }
      .submit-btn {
        background-color: gray; 
        border: none;
        transition: background-color 0.3s ease;
      }
      .submit-btn:hover {
        background-color: black; 
      }
    `,
    data() {
      return {
        error: '',
        cred: {
          rating: 0, // Store the selected star rating
          remarks: '',
        },
        token: localStorage.getItem("auth-token"),
      };
    },
    methods: {
      setRating(star) {
        console.log("Star clicked:", star); // Debugging
        this.cred.rating = star; // Set the rating
      },
      async submitCloseRequest() {
        if (!this.cred.rating || !this.cred.remarks.trim()) {
          this.error = "Both rating and remarks are required.";
          return;
        }
  
        console.log("Submitting to URL:", `/api/close/${this.$route.params.id}`);
        console.log("Payload:", {
          rating: this.cred.rating,
          remarks: this.cred.remarks,
          status: "closed",
        });
  
        try {
          const response = await fetch(`/api/close/${this.$route.params.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authentication-token": this.token,
            },
            body: JSON.stringify({
              rating: this.cred.rating,
              remarks: this.cred.remarks,
              status: "Closed",
            }),
          });
  
          if (!response.ok) throw new Error(await response.text());
          alert("Service closed successfully.");
          this.$router.push("/");
          window.location.reload(); 
        } catch (error) {
          console.error("Error closing service:", error);
          this.error = "Failed to close service. Please try again.";
        }
      },
    },
  };
  