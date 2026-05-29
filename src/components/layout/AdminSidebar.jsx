import { useState } from "react";
import toast from "react-hot-toast";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import {
  LayoutDashboard,
  Users,
  Building2,
  ShieldCheck,
  ClipboardList,
  GitBranch,
  FileBarChart2,
  Clock,
  UserCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  Globe,
} from "lucide-react";

const AdminSidebar = () => {
  const [userOpen, setUserOpen] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    toast.success("Logged out successfully", { icon: "⚠️", duration: 2000 });
    setTimeout(() => {
        dispatch(logout());
        localStorage.clear();
        navigate("/login");
    }, 600);
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
      isActive
        ? "bg-linear-to-r from-blue-50 to-indigo-50/60 text-blue-700 border border-blue-200/80 shadow-sm shadow-blue-100/50"
        : "text-slate-500 hover:bg-blue-50/40 hover:text-blue-600 border border-transparent"
    }`;

  const subLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
      isActive
        ? "bg-blue-50/60 text-blue-600"
        : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
    }`;

  return (
    <div className="h-screen flex flex-col bg-linear-to-b from-white via-blue-50/[0.04] to-blue-50/[0.12] border-r border-blue-100/50">
      {/* BRAND — matching login page style */}
      <div className="px-5 py-5 border-b border-blue-100/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-200">
            <Globe className="text-white" size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 tracking-tight">Corporate Travel Hub</h1>
            <p className="text-[11px] text-slate-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NavLink to="/admin/dashboard" className={linkClass} end>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        {/* User Management (expandable) */}
        <div>
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all duration-200 border border-transparent"
          >
            <span className="flex items-center gap-3">
              <Users size={18} />
              <span>User Management</span>
            </span>
            {userOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>
          {userOpen && (
            <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-200 pl-3">
              <NavLink to="/admin/users" className={subLinkClass} end>
                <Users size={14} />
                All Users
              </NavLink>
              <NavLink to="/admin/users?role=EMPLOYEE" className={subLinkClass}>
                <Users size={14} />
                Employees
              </NavLink>
              <NavLink to="/admin/users?role=MANAGER" className={subLinkClass}>
                <Users size={14} />
                Managers
              </NavLink>
              <NavLink to="/admin/users?role=FINANCE" className={subLinkClass}>
                <Users size={14} />
                Finance Users
              </NavLink>
            </div>
          )}
        </div>

        <NavLink to="/admin/departments" className={linkClass}>
          <Building2 size={18} />
          <span>Department Management</span>
        </NavLink>

        <NavLink to="/admin/policies" className={linkClass}>
          <ShieldCheck size={18} />
          <span>Travel Policies</span>
        </NavLink>

        <NavLink to="/admin/requests" className={linkClass}>
          <ClipboardList size={18} />
          <span>Travel Requests</span>
        </NavLink>

        <NavLink to="/admin/approvals" className={linkClass}>
          <GitBranch size={18} />
          <span>Approval Monitoring</span>
        </NavLink>

        <NavLink to="/admin/reports" className={linkClass}>
          <FileBarChart2 size={18} />
          <span>Reports</span>
        </NavLink>

        <NavLink to="/admin/audit" className={linkClass}>
          <Clock size={18} />
          <span>Audit Logs</span>
        </NavLink>

        <NavLink to="/admin/profile" className={linkClass}>
          <UserCircle size={18} />
          <span>Profile</span>
        </NavLink>
      </nav>

      {/* LOGOUT */}
      <div className="p-3 border-t border-blue-100/40">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-transparent"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
