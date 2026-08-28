import {setError, setUser, setLoading} from "../state/auth.slice";
import {register, login} from "../services/auth.api";
import {useDispatch} from "react-redux";

export const useAuth = () =>{
    const dispatch = useDispatch();

    const handleRegister = async({email, password, fullname, contact, isSeller = false}) => {
        const data = await register({email, password, fullname, contact, isSeller})
        dispatch(setUser(data.user))    
    }

    const handleLogin = async({email, password}) => {
        const data = await login({email, password})
        dispatch(setUser(data.user))    
    }

    return {handleRegister, handleLogin};
} 