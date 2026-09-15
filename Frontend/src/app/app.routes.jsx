import { createBrowserRouter } from "react-router";
import Register from "@/features/auth/pages/Register";
import Login from "@/features/auth/pages/Login";
import CreateProduct from "@/features/product/pages/CreateProduct";
import ProtectedRoute from "@/components/ProtectedRoute";
import BuyerRoute from "@/components/BuyerRoute";
import PublicAuthRoute from "@/components/PublicAuthRoute";
import Dashboard from "@/features/product/pages/Dashboard";
import Home from "@/features/product/pages/Home";
import ProductDetail from "@/features/product/pages/ProductDetail";

export const routes = createBrowserRouter([
    {
        path: "/",
        element: (
            <BuyerRoute>
                <Home />
            </BuyerRoute>
        )
    },
    {
        path: "/product/:id",
        element: <ProductDetail />
    },
    {
        path: "/products/:id",
        element: <ProductDetail />
    },
    {
        path: "/register",
        element: (
            <PublicAuthRoute>
                <Register />
            </PublicAuthRoute>
        )
    },
    {
        path: "/login",
        element: (
            <PublicAuthRoute>
                <Login />
            </PublicAuthRoute>
        )
    },
    {
        path: "/seller",
        children: [
            {
                index: true,
                element: (
                    <ProtectedRoute requiredRole="seller">
                        <Dashboard />
                    </ProtectedRoute>
                )
            },
            {
                path: "/seller/create-product",
                element: (
                    <ProtectedRoute requiredRole="seller">
                        <CreateProduct />
                    </ProtectedRoute>
                )
            },
            {
                path: "/seller/dashboard",
                element: (
                    <ProtectedRoute requiredRole="seller">
                        <Dashboard />
                    </ProtectedRoute>
                )
            },
            {
                path: "/seller/product/:id",
                element: (
                    <ProtectedRoute requiredRole="seller">
                        <ProductDetail />
                    </ProtectedRoute>
                )
            }
        ]
    }
]);