import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import {
  LayoutDashboard,
  Clock,
  ClipboardList,
  History,
  FileBarChart2,
  User,
  LogOut,
  Globe,
} from "lucide-react";

const ManagerSidebar = () => {
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
        ? "bg-purple-100 text-purple-700 border border-purple-200/80 shadow-sm"
        : "text-slate-500 hover:bg-purple-50 hover:text-purple-600 border border-transparent"
    }`;

  const items = [
    { title: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/manager/dashboard" },
    { title: "Pending Approvals", icon: <Clock size={18} />, path: "/manager/pending-approvals" },
    { title: "Requests History", icon: <ClipboardList size={18} />, path: "/manager/team-requests" },
    { title: "Travel History", icon: <History size={18} />, path: "/manager/team-history" },
    { title: "Reports", icon: <FileBarChart2 size={18} />, path: "/manager/reports" },
    { title: "Profile", icon: <User size={18} />, path: "/manager/profile" },
  ];

  return (
    <div className="h-screen flex flex-col bg-purple-50 border-r border-purple-100">
      <div className="px-5 py-5 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm shadow-purple-200">
            <Globe className="text-white" size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 tracking-tight">Corporate Travel Hub</h1>
            <p className="text-[11px] text-slate-400">Manager Oversight</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClass} end={item.path === "/manager/dashboard"}>
            {item.icon}
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-purple-100">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-transparent">
          <LogOut size={18} /> <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default ManagerSidebar;
