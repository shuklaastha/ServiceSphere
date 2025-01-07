export default {
    template: `
        <div>
            <div class="container d-flex justify-content-center align-items-center min-vh-100">
                <div class="card p-4 shadow-lg" style="max-width: 500px; width: 100%; background-color: rgba(255, 255, 255, 0.8); border-radius: 10px;">
                    <div class='text-danger mb-2'>*{{error}}</div>
                    <h2 class="text-center mb-4">Create Service</h2>
                    <div class="mb-3">
                        <label for="exampleFormControlInput1" class="form-label">Name</label>
                        <input type="text" class="form-control" id="exampleFormControlInput1" placeholder="Cleaning" required v-model="service.name">
                    </div>
                    <div class="mb-3">
                        <label for="inputPassword5" class="form-label">Description of the service</label>
                        <input type="text" id="desc" class="form-control" placeholder="Description..." required v-model="service.description">
                    </div>
                    <div class="mb-3">
                        <label for="exampleFormControlInput1" class="form-label">Base Price</label>
                        <input type="text" class="form-control" id="exampleFormControlInput1" placeholder="eg.:200" required v-model="service.base_price">
                        <small class="text-muted">Enter base price of service in rupees</small>
                    </div>
                    <div class="mb-3">
                        <label for="exampleFormControlInput1" class="form-label">Time Required</label>
                        <input type="text" class="form-control" id="exampleFormControlInput1" placeholder="eg.:20" required v-model="service.time_required">
                        <small class="text-muted">Enter time required for the service in minutes</small>
                    </div>
                    <div class="d-flex justify-content-center">
                        <button type="submit" class="btn btn-dark w-100 submit-btn" @click="CreateService">Submit</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            service: {
                name: null,
                description: null,
                base_price: null,
                time_required: null
            },
            error: "",
            token: localStorage.getItem('auth-token'),
            role: localStorage.getItem('role'),
        };
    },
    methods: {
        async CreateService() {
            const res = await fetch('/api/services', {
                method: "POST",
                headers: {
                    'Authentication-Token': this.token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.service),
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                this.$router.push('/');
                window.location.reload();
            } else {
                this.error = data.message;
            }
        },
    },
    mounted() {
        if (this.role !== 'admin') {
            alert("You are not authorized to view this page.");
            window.location.href = '/'; 
        }
    }
};
