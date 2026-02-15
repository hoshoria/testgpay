import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserProvider, useUser } from './context/UserContext';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import BinDetailPage from './pages/BinDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isLoggedIn } = useUser();
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
    const { isLoggedIn } = useUser();
    if (isLoggedIn) return <Navigate to="/" replace />;
    return <>{children}</>;
}

export default function App() {
    return (
        <UserProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
                        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/admin/bin/:bin" element={<BinDetailPage />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </UserProvider>
    );
}
