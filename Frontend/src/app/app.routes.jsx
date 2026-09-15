import {createBrowserRouter} from "react-router"
import Register from "@/features/auth/pages/Register"
import Login from "@/features/auth/pages/Login"
import CreateProduct from "@/features/product/pages/CreateProduct"
import ProtectedRoute from "@/components/ProtectedRoute"
import Dashboard from "@/features/product/pages/Dashboard"

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
        path: "/seller",
        children: [
            {
                index: true,
                element: (
                    <ProtectedRoute requiredRole="seller">
                        <Dashboard/>
                    </ProtectedRoute>
                )
            },
            {
                path: "/seller/create-product",
                element: (
                    <ProtectedRoute requiredRole="seller">
                        <CreateProduct/>
                    </ProtectedRoute>
                )
            },
            {
                path: "/seller/dashboard",
                element: (
                    <ProtectedRoute requiredRole="seller">
                        <Dashboard/>
                    </ProtectedRoute>
                )
            }
        ]
    }
])