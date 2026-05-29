import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import {
  LayoutDashboard,
  ClipboardList,
  MapPinned,
  Receipt,
  DollarSign,
  History,
  User,
  LogOut,
  Globe,
} from "lucide-react";

const EmployeeSidebar = () => {
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
        ? "bg-blue-50 text-blue-700 border border-blue-200"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent"
    }`;

  const menuItems = [
    { title: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/employee/dashboard" },
    { title: "Requests", icon: <ClipboardList size={18} />, path: "/employee/requests" },
    { title: "Itineraries", icon: <MapPinned size={18} />, path: "/employee/itineraries" },
    { title: "Expenses", icon: <Receipt size={18} />, path: "/employee/expenses" },
    { title: "Reimbursements", icon: <DollarSign size={18} />, path: "/employee/reimbursements" },
    { title: "Travel History", icon: <History size={18} />, path: "/employee/history" },
    { title: "Profile", icon: <User size={18} />, path: "/employee/profile" },
  ];

  return (
    <div className="h-screen flex flex-col bg-white border-r border-slate-200">
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-200">
            <Globe className="text-white" size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 tracking-tight">Corporate Travel Hub</h1>
            <p className="text-[11px] text-slate-400">Employee Portal</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClass} end={item.path === "/employee/dashboard"}>
            {item.icon}
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-100">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-transparent">
          <LogOut size={18} /> <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default EmployeeSidebar;
