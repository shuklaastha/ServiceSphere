import Home from "./components/Home.js"
import Login from "./components/Login.js"
import Users from "./components/Users.js"
import CreateService from "./components/Serviceform.js"
import EditService from "./components/Editservice.js"
import ServiceCard from "./components/ServiceCard.js"
import Create_user from "./components/Create_user.js"
import Create_professional from "./components/Create_professional.js"
import Close_service from "./components/Close_service.js"
import Searchuser from "./components/Searchuser.js"
import Searchadmin from "./components/Searchadmin.js"
import Searchprof from "./components/Searchprof.js"
import Summaryadmin from "./components/Summaryadmin.js"
import Summaryuser from "./components/Summaryuser.js"
import Summaryprof from "./components/Summaryprof.js"

const routes=[{path:'/', component: Home, name: 'Home'},
            {path:'/create_user', component: Create_user, name: 'Create_user'},
            {path:'/create_professional', component: Create_professional, name: 'Create_professional'},
            {path:'/login', component: Login, name: 'Login'},
            {path: '/users', component: Users },
            {path: '/create_service', component: CreateService, name: 'CreateService'},
            {path: '/edit_service/:id',name: 'EditService',component: EditService, props: route => ({ id: route.params.id,  service: route.query }),},
            {path: '/services/:id/:completion_time/professionals', name: 'ServiceCard', component: ServiceCard,},
            {path: '/close/:id', name: 'Close_service', component:Close_service},
            {path: '/search-user/:query', name:'Searchuser', component:Searchuser},
            {path: '/admin-search/:query', name:'Searchadmin', component:Searchadmin},
            {path: '/search-professional/:query/:prof_id', name:'Searchprof', component:Searchprof},
            {path: '/summary-admin', name:'Summaryadmin', component:Summaryadmin},
            {path:  '/summary-user', name:'Summaryuser', component: Summaryuser},
            {path:  '/summary-prof', name:'Summaryprof', component: Summaryprof}]
            

export default new VueRouter({
    routes,
});