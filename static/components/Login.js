export default {
    template: `
      <div>
          <div class="container d-flex justify-content-center align-items-center min-vh-100">
              <div class="card p-4 shadow-lg" style="max-width: 500px; width: 100%; background-color: rgba(255, 255, 255, 0.8); border-radius: 10px;">
                  <div class='text-danger mb-2'>*{{error}}</div>
                  <h2 class="text-center mb-4">Login</h2>
                  <div class="mb-3">
                      <label for="exampleFormControlInput1" class="form-label">Email address</label>
                      <input type="email" class="form-control" id="exampleFormControlInput1" placeholder="name@example.com" required v-model="cred.email">
                  </div>
                  <div class="mb-3">
                      <label for="inputPassword5" class="form-label">Password</label>
                      <input type="password" id="inputPassword5" class="form-control" aria-describedby="passwordHelpBlock" placeholder="Password" required v-model="cred.password">
                  </div>
                  <div class="d-flex justify-content-center">
                      <button type="submit" class="btn btn-dark w-100 submit-btn" @click="login">Submit</button>
                  </div>
                  <div class="text-center mt-3">
                      <span>First time visiting this site? <router-link class="reg" to="/create_user">Register here</router-link></span>
                  </div>
              </div>
          </div>
      </div>
    `,
    style: `
      .card {
          background-color: rgba(255, 255, 255, 0.8);
      }
      .submit-btn {
          background-color: gray; 
          border: none;
          transition: background-color 0.3s ease;
      }
      .submit-btn:hover {
          background-color: black; 
      }
      .reg {
          color: black !important; 
          text-decoration: none !important; 
          font-weight: bold !important; 
          transition: color 0.3s ease !important;
      }
      .reg:hover {
          color: #333333 !important; 
          text-decoration: none !important; 
      }
    `,
    data() {
      return {
        cred: {
          email: null,
          password: null,
        },
        error: null,
      };
    },
    methods: {
      async login() {
        try {
          const res = await fetch('/user_login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.cred),
          });
  
          const data = await res.json();
  
          if (res.ok) {
            console.log(data)
            if (data.active) {
              localStorage.setItem('auth-token', data.token);
              localStorage.setItem('role', data.role);
              localStorage.setItem('active', data.active);
              if (data.role === 'customer' || data.role === 'admin') {
                localStorage.setItem('user_id', data.id);}
              else{
                localStorage.setItem('prof_id', data.professional_id);
                localStorage.setItem('user_id', data.id);
              }
              localStorage.setItem('name', data.name);
              this.$router.push({ path: '/', query: { role: data.role } });
              window.location.reload();
            } else if (data.role === 'professional') {
              this.error = "Your account is not activated yet, please wait for the admin to activate your account.";
            } else if (data.role === 'customer') {
              this.error = "Your account has been blocked by the admin due to a policy breach.";
            }
          } else {
            this.error = data.message || "Login failed. Please check your credentials.";
          }
        } catch (err) {
          console.error(err);
          this.error = "An error occurred while logging in. Please try again later.";
        }
      },
    },
  };
  