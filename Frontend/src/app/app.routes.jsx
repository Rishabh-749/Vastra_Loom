import {createBrowserRouter} from "react-router"
import Register from "@/features/auth/pages/Register"
import Login from "@/features/auth/pages/Login"
import CreateProduct from "@/features/product/pages/CreateProduct"
import ProtectedRoute from "@/components/ProtectedRoute"

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <h1>Hello world</h1>
    },
    {
        path: "/register",
        element: <Register/>
    },
    {
        path: "/login",
        element: <Login/>
    },
    {
        path: "/seller/create-product",
        element: (
            <ProtectedRoute requiredRole="seller">
                <CreateProduct/>
            </ProtectedRoute>
        )
    }
])