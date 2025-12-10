import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import React from "react";
import LoadingSpinner from "../ui/LoadingSpinner";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({children}: ProtectedRouteProps) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoading = useAuthStore((state) => state.isLoading);

    // Wait for auth to initialize
    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}
export default ProtectedRoute;