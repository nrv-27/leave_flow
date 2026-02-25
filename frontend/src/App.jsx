import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import EmployeeLogin from './pages/EmployeeLogin.jsx';
import ManagerLogin from './pages/ManagerLogin.jsx';
import EmployeeDashboard from './pages/employee/Dashboard.jsx';
import ManagerDashboard from './pages/manager/Dashboard.jsx';
import ApplyLeave from './pages/employee/ApplyLeave.jsx';
import MyLeaves from './pages/employee/MyLeaves.jsx';
import AttendanceTracker from './pages/employee/Attendance.jsx';
import TeamLeaves from './pages/manager/TeamLeaves.jsx';
import RuleEngine from './pages/manager/RuleEngine.jsx';
import Analytics from './pages/manager/Analytics.jsx';
import Layout from './layouts/Layout.jsx';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-surface-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login/employee" replace />;
  if (role && user.role !== role) return <Navigate to={`/dashboard/${user.role}`} replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login/employee" replace />} />
            <Route path="/login/employee" element={<EmployeeLogin />} />
            <Route path="/login/manager" element={<ManagerLogin />} />
            <Route path="/dashboard/employee" element={<ProtectedRoute role="employee"><Layout><EmployeeDashboard /></Layout></ProtectedRoute>} />
            <Route path="/dashboard/employee/apply" element={<ProtectedRoute role="employee"><Layout><ApplyLeave /></Layout></ProtectedRoute>} />
            <Route path="/dashboard/employee/leaves" element={<ProtectedRoute role="employee"><Layout><MyLeaves /></Layout></ProtectedRoute>} />
            <Route path="/dashboard/employee/attendance" element={<ProtectedRoute role="employee"><Layout><AttendanceTracker /></Layout></ProtectedRoute>} />
            <Route path="/dashboard/manager" element={<ProtectedRoute role="manager"><Layout><ManagerDashboard /></Layout></ProtectedRoute>} />
            <Route path="/dashboard/manager/leaves" element={<ProtectedRoute role="manager"><Layout><TeamLeaves /></Layout></ProtectedRoute>} />
            <Route path="/dashboard/manager/rules" element={<ProtectedRoute role="manager"><Layout><RuleEngine /></Layout></ProtectedRoute>} />
            <Route path="/dashboard/manager/analytics" element={<ProtectedRoute role="manager"><Layout><Analytics /></Layout></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
