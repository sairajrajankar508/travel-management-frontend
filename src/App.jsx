import { Toaster } from "react-hot-toast";
import { Routes, Route, Navigate } from "react-router-dom";

// =======================================
// AUTH
// =======================================

import LoginPage from "./pages/auth/LoginPage";

// =======================================
// LAYOUTS
// =======================================

import DashboardLayout from "./layouts/DashboardLayout";

// =======================================
// ROUTE PROTECTION
// =======================================

import ProtectedRoute from "./routes/ProtectedRoute";

// =======================================
// ADMIN PAGES
// =======================================

import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import DepartmentManagement from "./pages/admin/DepartmentManagement";
import PolicyManagement from "./pages/admin/PolicyManagement";
import AdminTravelRequests from "./pages/admin/TravelRequests";
import ApprovalMonitoring from "./pages/admin/ApprovalMonitoring";
import Reports from "./pages/admin/Reports";
import AuditLogs from "./pages/admin/AuditLogs";
import AdminProfile from "./pages/admin/AdminProfile";

// =======================================
// EMPLOYEE PAGES
// =======================================

import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeTravelRequests from "./pages/employee/TravelRequests";
import MyItineraries from "./pages/employee/MyItineraries";
import ExpenseManagement from "./pages/employee/ExpenseManagement";
import EmployeeReimbursements from "./pages/employee/Reimbursements";
import TravelHistory from "./pages/employee/TravelHistory";
import EmployeeProfile from "./pages/employee/Profile";

// =======================================
// MANAGER PAGES
// =======================================

import ManagerDashboard from "./pages/manager/ManagerDashboard";
import PendingApprovals from "./pages/manager/PendingApprovals";
import TeamRequests from "./pages/manager/TeamRequests";
import TeamHistory from "./pages/manager/TeamHistory";
import ManagerReports from "./pages/manager/ManagerReports";
import ManagerProfile from "./pages/manager/ManagerProfile";

// =======================================
// FINANCE PAGES
// =======================================

import FinanceDashboard from "./pages/finance/FinanceDashboard";
import FinancePendingApprovals from "./pages/finance/PendingApprovals";
import FinanceExpenseMgmt from "./pages/finance/ExpenseManagement";
import FinanceReimbursements from "./pages/finance/Reimbursements";
import FinanceTravelRequests from "./pages/finance/FinanceTravelRequests";
import FinanceReports from "./pages/finance/FinanceReports";
import FinanceProfile from "./pages/finance/FinanceProfile";

// =======================================
// COMMON PAGES
// =======================================

const Unauthorized = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <h1 className="text-3xl font-bold text-red-500">
                Unauthorized Access 🚫
            </h1>
        </div>
    );
};

function App() {

    return (
        <>
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

        <Routes>

            {/* ======================================= */}
            {/* PUBLIC ROUTES */}
            {/* ======================================= */}

            <Route
                path="/login"
                element={<LoginPage />}
            />

            <Route
                path="/unauthorized"
                element={<Unauthorized />}
            />

            {/* ======================================= */}
            {/* PROTECTED ROUTES */}
            {/* ======================================= */}

            <Route element={<ProtectedRoute />}>

                <Route element={<DashboardLayout />}>

                    {/* ======================================= */}
                    {/* ROOT REDIRECT */}
                    {/* ======================================= */}

                    <Route
                        path="/"
                        element={<Navigate to="/login" replace />}
                    />

                    {/* ======================================= */}
                    {/* ADMIN ROUTES */}
                    {/* ======================================= */}

                    <Route
                        element={
                            <ProtectedRoute
                                allowedRoles={["ADMIN"]}
                            />
                        }
                    >

                        <Route
                            path="/admin/dashboard"
                            element={<AdminDashboard />}
                        />

                        <Route
                            path="/admin/users"
                            element={<UserManagement />}
                        />

                        <Route
                            path="/admin/departments"
                            element={<DepartmentManagement />}
                        />

                        <Route
                            path="/admin/policies"
                            element={<PolicyManagement />}
                        />

                        <Route
                            path="/admin/requests"
                            element={<AdminTravelRequests />}
                        />

                        <Route
                            path="/admin/approvals"
                            element={<ApprovalMonitoring />}
                        />

                        <Route
                            path="/admin/reports"
                            element={<Reports />}
                        />

                        <Route
                            path="/admin/audit"
                            element={<AuditLogs />}
                        />

                        <Route
                            path="/admin/profile"
                            element={<AdminProfile />}
                        />

                    </Route>

                    {/* ======================================= */}
                    {/* EMPLOYEE ROUTES */}
                    {/* ======================================= */}

                    <Route
                        element={
                            <ProtectedRoute
                                allowedRoles={["EMPLOYEE"]}
                            />
                        }
                    >

                        <Route
                            path="/employee/dashboard"
                            element={<EmployeeDashboard />}
                        />

                        <Route
                            path="/employee/requests"
                            element={<EmployeeTravelRequests />}
                        />

                        <Route
                            path="/employee/itineraries"
                            element={<MyItineraries />}
                        />

                        <Route
                            path="/employee/itinerary/:requestId"
                            element={<MyItineraries />}
                        />

                        <Route
                            path="/employee/expenses"
                            element={<ExpenseManagement />}
                        />

                        <Route
                            path="/employee/reimbursements"
                            element={<EmployeeReimbursements />}
                        />

                        <Route
                            path="/employee/history"
                            element={<TravelHistory />}
                        />

                        <Route
                            path="/employee/profile"
                            element={<EmployeeProfile />}
                        />

                    </Route>

                    {/* ======================================= */}
                    {/* MANAGER ROUTES */}
                    {/* ======================================= */}

                    <Route
                        element={
                            <ProtectedRoute
                                allowedRoles={["MANAGER"]}
                            />
                        }
                    >

                        <Route
                            path="/manager/dashboard"
                            element={<ManagerDashboard />}
                        />

                        <Route
                            path="/manager/pending-approvals"
                            element={<PendingApprovals />}
                        />

                        <Route
                            path="/manager/team-requests"
                            element={<TeamRequests />}
                        />

                        <Route
                            path="/manager/team-history"
                            element={<TeamHistory />}
                        />

                        <Route
                            path="/manager/reports"
                            element={<ManagerReports />}
                        />

                        <Route
                            path="/manager/profile"
                            element={<ManagerProfile />}
                        />

                    </Route>

                    {/* ======================================= */}
                    {/* FINANCE ROUTES */}
                    {/* ======================================= */}

                    <Route
                        element={
                            <ProtectedRoute
                                allowedRoles={["FINANCE"]}
                            />
                        }
                    >

                        <Route
                            path="/finance/dashboard"
                            element={<FinanceDashboard />}
                        />

                        <Route
                            path="/finance/pending-approvals"
                            element={<FinancePendingApprovals />}
                        />

                        <Route
                            path="/finance/expenses"
                            element={<FinanceExpenseMgmt />}
                        />

                        <Route
                            path="/finance/reimbursements"
                            element={<FinanceReimbursements />}
                        />

                        <Route
                            path="/finance/travel-requests"
                            element={<FinanceTravelRequests />}
                        />

                        <Route
                            path="/finance/reports"
                            element={<FinanceReports />}
                        />

                        <Route
                            path="/finance/profile"
                            element={<FinanceProfile />}
                        />

                    </Route>

                </Route>

            </Route>

            {/* ======================================= */}
            {/* 404 ROUTE */}
            {/* ======================================= */}

            <Route
                path="*"
                element={
                    <div className="flex items-center justify-center min-h-screen text-3xl font-bold">
                        404 Page Not Found
                    </div>
                }
            />

        </Routes>
        </>
    );
}

export default App;
