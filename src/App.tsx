import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import ManagerDashboard from "@/pages/manager/Dashboard";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import StaffDashboard from "@/pages/staff/Dashboard";
import SuperadminDashboard from "@/pages/superadmin/Dashboard";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/forgot-password" element={<ForgotPasswordPage />} />
				<Route path="/reset-password" element={<ResetPasswordPage />} />

				<Route element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
					<Route path="/superadmin" element={<SuperadminDashboard />} />
				</Route>

				<Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
					<Route path="/manager" element={<ManagerDashboard />} />
				</Route>

				<Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
					<Route path="/staff" element={<StaffDashboard />} />
				</Route>

				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
