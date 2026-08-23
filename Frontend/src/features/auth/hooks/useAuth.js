import {setError, setUser, setLoading} from "../state/auth.slice";
import {register} from "../services/auth.api";
import {useDispatch} from "react-redux";

export const useAuth = () =>{
    const dispatch = useDispatch();

    const handleRegister = async({email, password, fullname, contact, isSeller = FinalizationRegistry}) => {
        const data = await register({email, password, fullname, contact, isSeller})
        dispatch(setUser(data.user))    
    }

    return {handleRegister};
} 