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
        } catch {
            setPolicies([]);
            toast.error("Failed to load policies");
        }
        finally { setPoliciesLoading(false); }
    };

    const openPolicies = () => {
        fetchPolicies();
        setShowPolicies(true);
    };

    return (
        <><header className={`bg-white/90 backdrop-blur-sm border-b shadow-sm px-6 py-3 flex items-center justify-between ${
            role === "ADMIN" ? "border-red-200" :
            role === "MANAGER" ? "border-purple-200" :
            role === "FINANCE" ? "border-amber-200" :
            "border-blue-200"
        }`}>
           
            <div>
                <h1 className="text-lg font-bold text-slate-800">Corporate Travel Hub</h1>
                <p className="text-xs text-slate-400">{meta.label}</p>
            </div>

            
            <div className="flex items-center gap-4">
                
                <button onClick={openPolicies} className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition ${
                    role === "ADMIN" ? "text-slate-500 hover:text-red-600 hover:bg-red-50" :
                    role === "MANAGER" ? "text-slate-500 hover:text-purple-600 hover:bg-purple-50" :
                    role === "FINANCE" ? "text-slate-500 hover:text-amber-600 hover:bg-amber-50" :
                    "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                }`}>
                    <FileText size={16} /> Policies
                </button>

               
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${meta.avatar} flex items-center justify-center`}>
                        <User size={18} />
                    </div>
                    <div className="hidden md:block leading-tight">
                        <p className="text-sm font-semibold text-slate-800">{user?.name || "User"}</p>
                        <p className="text-xs text-slate-400">{user?.email}</p>
                    </div>
                </div>

                
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${meta.badge}`}>
                    <Shield size={13} />
                    <span>{role}</span>
                </div>

                
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition">
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </header>

       
        {showPolicies && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowPolicies(false)}>
                <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FileText size={20} /> Travel Policies</h2>
                        <button onClick={() => setShowPolicies(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X size={20} /></button>
                    </div>

                    {policiesLoading ? (
                        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" /></div>
                    ) : policies.length > 0 ? (
                        <div className="space-y-4">
                            {policies.map((p) => (
                                <div key={p.id} className={`rounded-2xl border overflow-hidden ${p.active ? "border-slate-200" : "border-red-200 opacity-70"}`}>
                                    <div className={`px-4 py-3 flex items-center justify-between ${p.active ? "bg-slate-50" : "bg-red-50"}`}>
                                        <div>
                                            <p className="font-semibold text-slate-800">{p.policyName || "Untitled Policy"}</p>
                                            {p.description && <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>}
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ml-3 ${p.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                            {p.active ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                                        <div>
                                            <p className="text-xs text-slate-400">Max Budget</p>
                                            <p className="font-medium text-slate-800">₹{p.maxBudget?.toLocaleString() || "—"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Allowed Class</p>
                                            <p className="font-medium text-slate-800">{p.allowedClass || "Any"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Max Trip Days</p>
                                            <p className="font-medium text-slate-800">{p.maxTripDays != null ? p.maxTripDays : "—"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Per Day</p>
                                            <p className="font-medium text-slate-800">{p.perDiemAllowance != null ? "₹" + p.perDiemAllowance.toLocaleString() : "—"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Hotel Limit/Night</p>
                                            <p className="font-medium text-slate-800">{p.hotelLimitPerNight != null ? "₹" + p.hotelLimitPerNight.toLocaleString() : "—"}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <FileText size={40} className="mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-400">No policies found</p>
                            <p className="text-xs text-slate-300 mt-1">Policies created by admin will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        )}
        </>
    );
};

export default Navbar;