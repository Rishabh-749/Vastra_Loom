import { createBrowserRouter, Navigate } from "react-router";
import Register from "@/features/auth/pages/Register";
import Login from "@/features/auth/pages/Login";
import CreateProduct from "@/features/product/pages/CreateProduct";
import ProtectedRoute from "@/components/ProtectedRoute";
import BuyerRoute from "@/components/BuyerRoute";
import PublicAuthRoute from "@/components/PublicAuthRoute";
import Dashboard from "@/features/product/pages/Dashboard";
import Home from "@/features/product/pages/Home";
import ProductDetail from "@/features/product/pages/ProductDetail";
import Cart from "@/features/cart/pages/Cart";

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
        path: "/cart",
        element: (
            <BuyerRoute>
                <Cart />
            </BuyerRoute>
        )
    },
    {
        path: "/product/:id",
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
        element: <ProtectedRoute requiredRole="seller" />,
        children: [
            {
                index: true,
                element: <Dashboard />
            },
            {
                path: "dashboard",
                element: <Dashboard />
            },
            {
                path: "create-product",
                element: <CreateProduct />
            },
            {
                path: "product/:id",
                element: <ProductDetail />
            }
        ]
    },
    {
        path: "*",
        element: <Navigate to="/" replace />
    }
]);