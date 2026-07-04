import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/components/nav/DashboardLayout";
import { StaffList } from "@/components/staff/StaffList";
import ComingSoon from "@/pages/ComingSoon";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import ManagerDashboard from "@/pages/manager/Dashboard";
import ManagerRoomsPage from "@/pages/manager/Rooms";
import ManagerStudentsPage from "@/pages/manager/Students";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import StaffDashboard from "@/pages/staff/Dashboard";
import { StaffProfilePage } from "@/pages/staff/Profile";
import StaffRoomsPage from "@/pages/staff/Rooms";
import SuperadminDashboard from "@/pages/superadmin/Dashboard";
import SuperadminRoomsPage from "@/pages/superadmin/Rooms";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

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
						element={
							<DashboardLayout role="superadmin">
								<ComingSoon title="Students" />
							</DashboardLayout>
						}
					/>
					<Route path="/superadmin/rooms" element={<SuperadminRoomsPage />} />
					<Route
						path="/superadmin/staff"
						element={
							<DashboardLayout role="superadmin">
								<ComingSoon title="Staff" />
							</DashboardLayout>
						}
					/>
					<Route
						path="/superadmin/leave"
						element={
							<DashboardLayout role="superadmin">
								<ComingSoon title="Leave Requests" />
							</DashboardLayout>
						}
					/>
				</Route>

				{/* Manager */}
				<Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
					<Route path="/manager" element={<ManagerDashboard />} />
					<Route path="/manager/students" element={<ManagerStudentsPage />} />
					<Route path="/manager/rooms" element={<ManagerRoomsPage />} />
					<Route
						path="/manager/staff"
						element={
							<DashboardLayout role="manager">
								<StaffList />
							</DashboardLayout>
						}
					/>
					<Route
						path="/manager/leave"
						element={
							<DashboardLayout role="manager">
								<ComingSoon title="Leave Requests" />
							</DashboardLayout>
						}
					/>
				</Route>

				{/* Staff */}
				<Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
					<Route path="/staff" element={<StaffDashboard />} />
					<Route
						path="/staff/attendance"
						element={
							<DashboardLayout role="staff">
								<ComingSoon title="Attendance" />
							</DashboardLayout>
						}
					/>
					<Route path="/staff/rooms" element={<StaffRoomsPage />} />
					<Route
						path="/staff/profile"
						element={
							<DashboardLayout role="staff">
								<StaffProfilePage />
							</DashboardLayout>
						}
					/>
				</Route>

				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
