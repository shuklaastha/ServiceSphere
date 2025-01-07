export default {
  template: 
    `<div>
      <h1 class="text-center my-4" style="color: #F9F6EE; font-family: 'Poppins', sans-serif;">Users</h1>
      <div class="container translucent-table">
        <table class="table table-striped table-bordered">
          <thead>
            <tr class="text-center">
              <th>S.no.</th>
              <th>Email</th>
              <th>Active</th>
              <th>Role</th>
              <th>Service Type</th>
              <th>Experience</th>
              <th>Availability</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in filteredUsers" :key="user.id" class="text-center">
              <td>{{ index + 1 }}</td>
              <td>{{ user.email || '-' }}</td>
              <td>{{ user.active ? "Yes" : "No" }}</td>
              <td>{{ user.roles || '-' }}</td>
              <td>{{ user.professional_data?.service_type || '-' }}</td>
              <td>{{ user.professional_data?.experience ? user.professional_data.experience + ' years' : '-' }}</td>
              <td>
                {{ 
                  user.professional_data?.availability_status !== undefined 
                  ? (user.professional_data.availability_status ? "Available" : "Unavailable") 
                  : '-'
                }}
              </td>
              <td>
                <button
                  v-if="!user.active"
                  type="button"
                  class="btn btn-dark"
                  @click="confirmActivate(user.id)"
                >
                  Activate
                </button>
                <button
                  v-if="user.active"
                  type="button"
                  class="btn btn-dark"
                  @click="confirmDeactivate(user.id)"
                >
                  Deactivate
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>`,
    
  style: `
    .translucent-table {
      background-color: rgba(255, 255, 255, 0.6); /* Semi-transparent white */
      backdrop-filter: blur(10px); /* Blur effect */
      padding: 20px;
      border-radius: 15px; /* Rounded corners */
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Optional shadow */
    }

    .table-striped > tbody > tr:nth-of-type(odd) {
      background-color: rgba(255, 255, 255, 0.4); /* Subtle striping with translucency */
    }

    .table-bordered {
      border: 1px solid rgba(255, 255, 255, 0.4); /* Lighter border */
    }

    .table th, .table td {
      vertical-align: middle;
    }
  `,
  
  data() {
    return {
      allUsers: [],
      token: localStorage.getItem("auth-token"),
      
    };
  },
  computed: {
    // Filter out "admin" users
    filteredUsers() {
      return this.allUsers.filter(user => user.roles !== 'admin');
    },
  },
  async mounted() {
    const res = await fetch('/users', {
      headers: {
        'Authentication-token': this.token,
      },
    });
    const data = await res.json();
    if (res.ok) {
      this.allUsers = data;
    }
  },
  methods: {
    confirmActivate(prof_id) {
      const confirmAction = confirm("Are you sure you want to activate this user?");
      if (confirmAction) {
        this.activate(prof_id);
      }
    },
    async activate(prof_id) {
      const res = await fetch(`/activate_professional/${prof_id}`, {
        headers: {
          'Authentication-Token': this.token,
        },
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        window.location.reload();
      }
    },

    // Confirmation for Deactivate
    confirmDeactivate(prof_id) {
      const confirmAction = confirm("Are you sure you want to deactivate this user?");
      if (confirmAction) {
        this.deactivate(prof_id);
      }
    },
    async deactivate(prof_id) {
      const res = await fetch(`/deactivate_professional/${prof_id}`, {
        method: "POST",
        headers: {
          'Authentication-Token': this.token,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        window.location.reload();
      }
    },

    // Delete Professional
    async deleteProfessional(prof_id) {
      const confirmDelete = confirm("Are you sure you want to delete this professional?");
      if (!confirmDelete) return;

      const res = await fetch(`/delete_professional/${prof_id}`, {
        method: "DELETE",
        headers: {
          'Authentication-Token': this.token,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        window.location.reload();
      } else {
        alert(data.error || "Failed to delete professional.");
      }
    },
  },
};
