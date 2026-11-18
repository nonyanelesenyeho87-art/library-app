import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BooksPage from './pages/BooksPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

export default function App() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <main className="container">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/books" element={<ProtectedRoute adminOnly><BooksPage /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
