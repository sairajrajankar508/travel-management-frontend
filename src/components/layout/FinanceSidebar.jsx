import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import {
  LayoutDashboard,
  ClipboardCheck,
  Receipt,
  Wallet,
  Plane,
  FileBarChart2,
  User,
  LogOut,
  Globe,
} from "lucide-react";

const FinanceSidebar = () => {
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
        ? "bg-amber-100 text-amber-700 border border-amber-200/80 shadow-sm"
        : "text-slate-500 hover:bg-amber-50 hover:text-amber-600 border border-transparent"
    }`;

  const menuItems = [
    { title: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/finance/dashboard" },
    { title: "Pending Approvals", icon: <Plane size={18} />, path: "/finance/travel-requests" },
    { title: "Pending Expenses", icon: <ClipboardCheck size={18} />, path: "/finance/pending-approvals" },
    { title: "Expense Management", icon: <Receipt size={18} />, path: "/finance/expenses" },
    { title: "Reimbursements", icon: <Wallet size={18} />, path: "/finance/reimbursements" },
    { title: "Reports", icon: <FileBarChart2 size={18} />, path: "/finance/reports" },
    { title: "Profile", icon: <User size={18} />, path: "/finance/profile" },
  ];

  return (
    <div className="h-screen flex flex-col bg-amber-50 border-r border-amber-100">
      <div className="px-5 py-5 border-b border-amber-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-sm shadow-amber-200">
            <Globe className="text-white" size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 tracking-tight">Corporate Travel Hub</h1>
            <p className="text-[11px] text-slate-400">Finance Oversight</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClass} end={item.path === "/finance/dashboard"}>
            {item.icon}
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-amber-100">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-transparent">
          <LogOut size={18} /> <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default FinanceSidebar;
