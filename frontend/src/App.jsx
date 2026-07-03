import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import GuestRoute from "./routes/GuestRoute";
import RoleRoute from "./routes/RoleRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Attendance from "./pages/user/Attendance";
import AttendanceHistory from "./pages/user/AttendanceHistory";
import Leave from "./pages/user/Leave";
import AdminLeaveRequests from "./pages/admin/LeaveRequests";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import UserDashboard from "./pages/user/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import NotFound from "./pages/NotFound";
import MyTasks from "./pages/user/MyTasks";
import TaskDetail from "./pages/user/TaskDetail";
import AdminTasks from "./pages/admin/Tasks";
import CreateTask from "./pages/admin/CreateTask";
import Roles from "./pages/admin/Roles";
import AdminAttendance from "./pages/admin/Attendance";
import AdminUsers from "./pages/admin/Users";
import Reports from "./pages/admin/Reports";
import GradeSettings from "./pages/admin/GradeSettings";
import Profile from "./pages/user/Profile";



function HomeRedirect() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />

            {/* Guest-only routes */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Authenticated routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                {/* Employee routes */}
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/attendance-history" element={<AttendanceHistory />} />
                <Route path="/leave" element={<Leave />} />
                <Route path="/tasks" element={<MyTasks />} />
                <Route path="/tasks/:id" element={<TaskDetail />} />
                <Route path="/profile" element={<Profile />} />

                {/* Admin-only routes */}
                <Route element={<RoleRoute allowedRoles={["admin"]} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/leave" element={<AdminLeaveRequests />} />
                <Route path="/admin/tasks" element={<AdminTasks />} />
                <Route path="/admin/tasks/create" element={<CreateTask />} />
                <Route path="/admin/roles" element={<Roles />} />
                <Route path="/admin/attendance" element={<AdminAttendance />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/reports" element={<Reports />} />
                <Route path="/admin/grade-settings" element={<GradeSettings />} />
               </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}