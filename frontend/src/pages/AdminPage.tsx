import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/admin/LoginForm';
import Dashboard from '../components/admin/Dashboard';

export default function AdminPage() {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Dashboard /> : <LoginForm />;
}
