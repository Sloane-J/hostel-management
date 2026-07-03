import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import SuperadminDashboard from "@/pages/superadmin/Dashboard";
import ManagerDashboard from "@/pages/manager/Dashboard";
import StaffDashboard from "@/pages/staff/Dashboard";
import ComingSoon from "@/pages/ComingSoon";
import { DashboardLayout } from "@/components/nav/DashboardLayout";
import ManagerStudentsPage from "@/pages/manager/Students";
import ManagerRoomsPage from "@/pages/manager/Rooms";
import StaffRoomsPage from "@/pages/staff/Rooms";
import SuperadminRoomsPage from "@/pages/superadmin/Rooms";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Superadmin */}
        <Route element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
          <Route path="/superadmin" element={<SuperadminDashboard />} />
          <Route
            path="/superadmin/students"
            element={<DashboardLayout role="superadmin"><ComingSoon title="Students" /></DashboardLayout>}
          />
          <Route path="/superadmin/rooms" element={<SuperadminRoomsPage />} />
          <Route
            path="/superadmin/staff"
            element={<DashboardLayout role="superadmin"><ComingSoon title="Staff" /></DashboardLayout>}
          />
          <Route
            path="/superadmin/leave"
            element={<DashboardLayout role="superadmin"><ComingSoon title="Leave Requests" /></DashboardLayout>}
          />
        </Route>

        {/* Manager */}
        <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/manager/students" element={<ManagerStudentsPage />} />
          <Route path="/manager/rooms" element={<ManagerRoomsPage />} />
          <Route
            path="/manager/staff"
            element={<DashboardLayout role="manager"><ComingSoon title="Staff" /></DashboardLayout>}
          />
          <Route
            path="/manager/leave"
            element={<DashboardLayout role="manager"><ComingSoon title="Leave Requests" /></DashboardLayout>}
          />
        </Route>

        {/* Staff */}
        <Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
          <Route path="/staff" element={<StaffDashboard />} />
          <Route
            path="/staff/attendance"
            element={<DashboardLayout role="staff"><ComingSoon title="Attendance" /></DashboardLayout>}
          />
          <Route path="/staff/rooms" element={<StaffRoomsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;