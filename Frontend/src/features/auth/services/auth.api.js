import axios from "axios";

const authApiInstance = axios.create({
    baseURL: 'http://localhost:8080/api/auth',
    withCredentials: true
})

export const register = async(email, password, contact, fullname, isSeller) =>{
    const response = await authApiInstance.post("/register", {
        email,
        password,
        contact,
        fullname,
        isSeller
    });

    return response.data;
}