import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";

// ==========================================
// SIDEBARS
// ==========================================

import AdminSidebar from "../components/layout/AdminSidebar";
import EmployeeSidebar from "../components/layout/EmployeeSidebar";
import ManagerSidebar from "../components/layout/ManagerSidebar";
import FinanceSidebar from "../components/layout/FinanceSidebar";

// ==========================================
// NAVBAR
// ==========================================

import Navbar from "../components/layout/Navbar";

const DashboardLayout = () => {

    const { role } = useSelector(
        (state) => state.auth
    );

    // ==========================================
    // ROLE BASED SIDEBAR
    // ==========================================

    const renderSidebar = () => {

        switch (role) {

            case "ADMIN":
                return <AdminSidebar />;

            case "EMPLOYEE":
                return <EmployeeSidebar />;

            case "MANAGER":
                return <ManagerSidebar />;

            case "FINANCE":
                return <FinanceSidebar />;

            default:
                return (
                    <div className="p-5 text-red-500">
                        Invalid Role
                    </div>
                );
        }
    };

    return (

        <div className="flex h-screen bg-gray-100 overflow-hidden">

            {/* ========================================== */}
            {/* SIDEBAR */}
            {/* ========================================== */}

            <aside className="bg-white shadow-lg border-r border-gray-200 hidden md:block">

                {renderSidebar()}

            </aside>

            {/* ========================================== */}
            {/* MAIN CONTENT */}
            {/* ========================================== */}

            <div className="flex flex-col flex-1 overflow-hidden">

                {/* ========================================== */}
                {/* NAVBAR */}
                {/* ========================================== */}

                <div className="sticky top-0 z-50">

                    <Navbar />

                </div>

                {/* ========================================== */}
                {/* PAGE CONTENT */}
                {/* ========================================== */}

                <main className="flex-1 overflow-y-auto p-6 bg-gray-100">

                    <Outlet />

                </main>

            </div>

        </div>
    );
};

export default DashboardLayout;
