import Adminhome from "./Adminhome.js";
import Userhome from "./Userhome.js";
import Profhome from "./Profhome.js";

export default {
    template: `
        <div style="margin-top: 40px; margin-left: 25px; font-style: oblique;">
            <!-- Welcome Text -->
            <h1>Welcome Home, {{ name }}</h1>

            <!-- Main Section -->
            <div  v-if="!is_login" style="position: relative; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; color: white; padding-top: 60px;">
                
                <!-- Translucent Cards (Shown if Not Logged In) -->
                <div v-if="!is_login" style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; margin-bottom: 20px;">

                    <!-- Card 1 -->
                    <div class="card" style="background-color: rgba(255, 255, 255, 0.6); padding: 20px; text-align: center; border-radius: 10px; width: 300px; height: 200px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                        <h3>Certified and Approved Professionals</h3>
                        <p>Connect with reliable and skilled professionals who meet the highest standards of service.</p>
                    </div>

                    <!-- Card 2 -->
                    <div class="card" style="background-color: rgba(255, 255, 255, 0.6); padding: 20px; text-align: center; border-radius: 10px; width: 300px; height: 200px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                        <h3>Easy Service Booking</h3>
                        <p>Book services effortlessly and enjoy friendly, professional support at your convenience.</p>
                    </div>

                    <!-- Card 3 -->
                    <div class="card" style="background-color: rgba(255, 255, 255, 0.6); padding: 20px; text-align: center; border-radius: 10px; width: 300px; height: 200px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                        <h3>Provide Feedback and Ratings</h3>
                        <p>Share your experience by rating and providing remarks to ensure better future service.</p>
                    </div>
                </div>
                
                <!-- Buttons for Registration (Shown if Not Logged In) -->
                <div v-if="!is_login" style="text-align: center; margin-top: 10px;">
                    <button class="btn btn-dark m-2" style="width: 200px; font-size: 1.2rem;" @click="registerAsUser">Register as User</button>
                    <button class="btn btn-dark m-2" style="width: 250px; font-size: 1.2rem;" @click="registerAsProfessional">Register as Professional</button>
                </div>

                <!-- Dynamic Content Based on User Role -->
                </div>
            
            <div v-else>
                    <Adminhome v-if="userRole === 'admin'" />
                    <Userhome v-else-if="userRole === 'customer'" />
                    <Profhome v-else-if="userRole === 'professional' && active" />
                    <p v-else style="color: red;">Role not recognized or inactive.</p>
            </div>
        </div>
    `,
    data() {
        return {
            userRole: localStorage.getItem("role") || "", // Fetch the user role from localStorage
            active: localStorage.getItem("active") === "true", // Ensure active status is a boolean
            is_login: !!localStorage.getItem("auth-token"), // Check if the user is logged in
            name: localStorage.getItem("name") || "Guest", // Default to "Guest" if no name is found
        };
    },
    methods: {
        registerAsUser() {
            this.$router.push("/create_user");
        },
        registerAsProfessional() {
            this.$router.push("/create_professional");
        },
    },
    components: {
        Adminhome,
        Userhome,
        Profhome,
    },
};
