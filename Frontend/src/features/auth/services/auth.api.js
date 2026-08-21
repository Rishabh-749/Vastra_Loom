import axios from "axios";

const authApiInstance = axios.create({
    baseURL: 'http://localhost:8080/api/auth',
    withCredentials: true
})