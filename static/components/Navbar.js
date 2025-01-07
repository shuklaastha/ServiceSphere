export default {
  template: `
    <div>
        <!-- Navbar -->
        <nav class="navbar navbar-expand-lg bg-dark text-light shadow-sm">
            <div class="container-fluid">
                <!-- Logo and Branding -->
                <a class="navbar-brand d-flex align-items-center" href="#" style="font-family: 'Poppins', sans-serif;">
                    <h3 class="mb-0 me-2 text-light">ServiceSphere</h3>
                    <span style="font-size: 0.9rem; color: gray;">Home services application</span>
                </a>
                
                <!-- Toggler Button -->
                <button 
                    class="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNavAltMarkup" 
                    aria-controls="navbarNavAltMarkup" 
                    aria-expanded="false" 
                    aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
    
                <!-- Navbar Content -->
                <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <!-- Centered Search Bar -->
                    <div 
                        v-if="is_login" 
                        class="mx-auto d-flex justify-content-center" 
                        style="flex-grow: 1; max-width: 400px;">
                        <input 
                            type="text" 
                            placeholder="Search here..." 
                            style="width: 100%; padding: 5px; font-size: 0.9rem; border: 1px solid #ccc; border-radius: 5px; outline: none;"
                            v-model="query"
                        />
                        <button
                            @click="searchServices"
                            style="background-color: rgba(255, 255, 255, 0.8); 
                                   border: 1px solid #ccc; 
                                   color: #000; 
                                   padding: 5px 10px; 
                                   margin-left: 5px; 
                                   font-size: 0.9rem; 
                                   border-radius: 5px; 
                                   cursor: pointer;">
                            Search
                        </button>
                    </div>
    
                    <!-- Right-Aligned Buttons -->
                    <div class="navbar-nav d-flex align-items-center ms-auto">
                        <router-link 
                            class="nav-link text-light me-3" 
                            style="font-size: 1.1rem;" 
                            to="/">Home</router-link>
                        <router-link 
                            class="nav-link text-light me-3" 
                            style="font-size: 1.1rem;" 
                            to="/users" 
                            v-if="role === 'admin'">Users</router-link>
                        <router-link 
                            class="btn btn-outline-light me-3" 
                            style="font-size: 1rem;" 
                            to="/create_service" 
                            v-if="role === 'admin'">Create Service</router-link>
                        <button
                            @click="Summary" 
                            v-if="is_login"
                            class="btn btn-outline-light me-3" 
                            style="font-size: 1rem;"  
                            >Summary</button>
                            
                        <span 
                            class="btn btn-outline-light me-3" 
                            style="font-size: 1rem;" 
                            @click="logout" 
                            v-if="is_login">Logout</span>
                        <router-link 
                            class="btn btn-outline-light me-3" 
                            style="font-size: 1rem;" 
                            to="/login" 
                            v-if="!is_login">Login</router-link>
                    </div>
                </div>
            </div>
        </nav>
    </div>
  `,
  data() {
    return {
      role: localStorage.getItem("role"),
      is_login: !!localStorage.getItem("auth-token"),
      query: "",
      prof_id: null, 
    };
  },
  created() {
    if (this.role === "professional") {
      this.prof_id = localStorage.getItem("prof_id");
    }
  },
  methods: {
    logout() {
      localStorage.clear(); 
      this.$router.push({ path: "/login" });
      window.location.reload(); 
    },
    searchServices() {
      if (this.query.trim()) {
  
        if (this.role === "customer") {
          this.$router.push({ name: "Searchuser", params: { query: this.query } });
        } else if (this.role === "admin") {
          this.$router.push({ name: "Searchadmin", params: { query: this.query } });
        } else if (this.role === "professional") {
          this.$router.push({ name: "Searchprof", params: { query: this.query , prof_id:this.prof_id} });
        }
      } else {
        alert("Please enter a search term!");
      }
    },
    Summary(){
      if (this.role === "admin") {
        this.$router.push({ name: "Summaryadmin" });
      } else if (this.role === "customer") {
        this.$router.push({ name: "Summaryuser" });
      }
      else if (this.role === "professional") {
        this.$router.push({ name: "Summaryprof" });
      }
    },
  },
};
