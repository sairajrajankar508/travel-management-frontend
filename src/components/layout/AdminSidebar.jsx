import { useState } from "react";
import "react-hot-toast";
import { NavLink } from "react-router-dom";


import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ClipboardList,
  GitBranch,
  FileBarChart2,
  Clock,
  UserCircle,
  ChevronDown,
  ChevronRight,
  Globe,
} from "lucide-react";

const AdminSidebar = () => {
  const [userOpen, setUserOpen] = useState(true);
  
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
      isActive
        ? "bg-red-100 text-red-700 border border-red-200/80 shadow-sm"
        : "text-slate-500 hover:bg-red-50 hover:text-red-600 border border-transparent"
    }`;

  const subLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
      isActive
        ? "bg-red-100 text-red-700"
        : "text-slate-400 hover:bg-red-50 hover:text-red-600"
    }`;

  return (
    <div className="h-screen flex flex-col bg-red-50 border-r border-red-100">
      {/* BRAND */}
      <div className="px-5 py-5 border-b border-red-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm shadow-red-200">
            <Globe className="text-white" size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 tracking-tight">Corporate Travel Hub</h1>
            <p className="text-[11px] text-slate-400">Admin Panel</p>
          </div>
        </div>
      </div>

      
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NavLink to="/admin/dashboard" className={linkClass} end>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>


        <div>
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 border border-transparent"
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

      
    </div>
  );
};

export default AdminSidebar;
