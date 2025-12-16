import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    const token = localStorage.getItem('token');

    // Simple check for token existence. 
    // For better security, you might want to verify the token with the backend here or in a context.
    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
