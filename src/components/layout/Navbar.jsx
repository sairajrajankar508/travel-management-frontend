import { useState } from "react";
import toast from "react-hot-toast";
import { LogOut, User, Shield, FileText, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../features/auth/authSlice";
import apiClient from "../../services/apiClient";

const ROLE_META = {
    ADMIN: { label: "Admin Panel", badge: "bg-red-50 text-red-600 border-red-200", avatar: "bg-red-100 text-red-600" },
    EMPLOYEE: { label: "Employee Portal", badge: "bg-blue-50 text-blue-600 border-blue-200", avatar: "bg-blue-100 text-blue-600" },
    MANAGER: { label: "Manager Oversight", badge: "bg-purple-50 text-purple-600 border-purple-200", avatar: "bg-purple-100 text-purple-600" },
    FINANCE: { label: "Finance Console", badge: "bg-amber-50 text-amber-600 border-amber-200", avatar: "bg-amber-100 text-amber-600" },
};

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, role } = useSelector((state) => state.auth);
    const meta = ROLE_META[role] || ROLE_META.EMPLOYEE;
    const [showPolicies, setShowPolicies] = useState(false);
    const [policies, setPolicies] = useState([]);
    const [policiesLoading, setPoliciesLoading] = useState(false);

    const handleLogout = () => {
        toast.success("Logged out successfully", { icon: "⚠️", duration: 2000 });
        setTimeout(() => {
            dispatch(logout());
            navigate("/login");
        }, 600);
    };

    const fetchPolicies = async () => {
        setPoliciesLoading(true);
        try {
            const res = await apiClient.get("/policies");
            setPolicies(Array.isArray(res.data) ? res.data : []);
        } catch { setPolicies([]); }
        finally { setPoliciesLoading(false); }
    };

    const openPolicies = () => {
        fetchPolicies();
        setShowPolicies(true);
    };

    return (
        <header className="bg-white/90 backdrop-blur-sm border-b border-blue-100/50 shadow-sm px-6 py-3 flex items-center justify-between">
            {/* LEFT */}
            <div>
                <h1 className="text-lg font-bold text-slate-800">Corporate Travel Hub</h1>
                <p className="text-xs text-slate-400">{meta.label}</p>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4">
                {/* VIEW POLICIES */}
                <button onClick={openPolicies} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-50 transition">
                    <FileText size={16} /> Policies
                </button>

                {/* USER */}
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${meta.avatar} flex items-center justify-center`}>
                        <User size={18} />
                    </div>
                    <div className="hidden md:block leading-tight">
                        <p className="text-sm font-semibold text-slate-800">{user?.name || "User"}</p>
                        <p className="text-xs text-slate-400">{user?.email}</p>
                    </div>
                </div>

                {/* ROLE BADGE — matching login page pill style */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${meta.badge}`}>
                    <Shield size={13} />
                    <span>{role}</span>
                </div>

                {/* LOGOUT */}
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition">
                    <LogOut size={16} /> Logout
                </button>
            </div>

            {/* POLICIES MODAL */}
            {showPolicies && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowPolicies(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FileText size={20} /> Travel Policies</h2>
                            <button onClick={() => setShowPolicies(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X size={20} /></button>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">All active travel policies for your reference</p>

                        {policiesLoading ? (
                            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" /></div>
                        ) : policies.length > 0 ? (
                            <div className="space-y-3">
                                {policies.map((p) => (
                                    <div key={p.id} className={`rounded-2xl border p-4 ${p.active ? "bg-slate-50 border-slate-200" : "bg-red-50 border-red-200 opacity-70"}`}>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-800">
                                                    Max Budget: <span className="text-indigo-600">₹{p.maxBudget?.toLocaleString() || "N/A"}</span>
                                                </p>
                                                <p className="text-sm text-slate-600 mt-1">Allowed Class: <span className="font-medium">{p.allowedClass || "Any"}</span></p>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                {p.active ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 text-center py-8">No policies found</p>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;