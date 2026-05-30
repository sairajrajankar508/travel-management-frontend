import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../features/auth/authSlice";
import toast from "react-hot-toast";
import { Mail, Lock, ArrowRight, Globe, MapPin, Plane, Shield } from "lucide-react";

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token, role, loading, error } = useSelector((state) => state.auth);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const redirectBasedOnRole = useCallback((role) => {
        switch (role) {
            case "ADMIN": navigate("/admin/dashboard"); break;
            case "EMPLOYEE": navigate("/employee/dashboard"); break;
            case "MANAGER": navigate("/manager/dashboard"); break;
            case "FINANCE": navigate("/finance/dashboard"); break;
            default: navigate("/");
        }
    }, [navigate]);

    useEffect(() => {
        if (token && role) redirectBasedOnRole(role);
    }, [token, role, redirectBasedOnRole]);

    const handleLogin = async (e) => {
        e.preventDefault();
        const res = await dispatch(loginUser({ email, password }));
        const payload = res.payload;
        if (payload?.token) {
            localStorage.setItem("token", payload.token);
            localStorage.setItem("role", payload.role);
            toast.success("Login successful!");
            setTimeout(() => redirectBasedOnRole(payload.role), 400);
        }
    };

    return (
        <div className="min-h-screen bg-white flex">

            {/* ─── LEFT: 60% — Brand / Info ─── */}
            <div className="hidden lg:flex w-[60%] bg-linear-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden flex-col justify-center px-16 py-12">

                {/* subtle globe dots */}
                <div className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: "radial-gradient(circle at 20px 20px, rgba(100,116,139,0.08) 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                    }}
                />

                {/* decorative circles */}
                <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-slate-100/50" />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-slate-200/40" />

                <div className="relative z-10 max-w-lg">

                    {/* brand */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                            <Globe className="text-white" size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Corporate Travel Hub</h2>
                            <p className="text-xs text-slate-400">Travel Management System</p>
                        </div>
                    </div>

                    {/* hero text */}
                    <h1 className="text-4xl font-bold text-slate-800 leading-tight mb-4">
                        Manage your<br />Travel Trips
                    </h1>
                    <p className="text-slate-500 text-base leading-relaxed mb-10">
                        from Request to Reimbursement — manage your team&apos;s travel
                        in one place. Approvals, itineraries, expenses, and reports.
                    </p>

                    {/* feature cards */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { icon: Plane, label: "Travel Requests", desc: "Submit & track" },
                            { icon: MapPin, label: "Itineraries", desc: "Plan your trip" },
                            { icon: Shield, label: "Approvals", desc: "Fast reviews" },
                        ].map((f) => (
                            <div key={f.label} className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200 p-4">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                                    <f.icon size={18} className="text-blue-600" />
                                </div>
                                <p className="text-sm font-semibold text-slate-800">{f.label}</p>
                                <p className="text-xs text-slate-400">{f.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* footer */}
                    <p className="text-xs text-slate-300 mt-12">&copy; 2026 Corporate Travel Hub. All rights reserved.</p>
                </div>
            </div>

            {/* ─── RIGHT: 40% — Login Form ─── */}
            <div className="w-full lg:w-[40%] min-h-screen flex items-center justify-center p-6 bg-slate-50 lg:bg-white">
                <div className="w-full max-w-sm">

                    {/* mobile brand */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                            <Globe className="text-white" size={20} />
                        </div>
                        <div>
                            <p className="text-base font-bold text-slate-800">Corporate Travel Hub</p>
                            <p className="text-[11px] text-slate-400">Corporate Travel Management</p>
                        </div>
                    </div>

                    {/* heading */}
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome Back</h2>
                    <p className="text-sm text-slate-400 mb-8">Sign in to your account to continue</p>

                    {/* form */}
                    <form onSubmit={handleLogin} className="space-y-4">

                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email" placeholder="Email address"
                                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                value={email} onChange={(e) => setEmail(e.target.value)} required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password" placeholder="Password"
                                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                value={password} onChange={(e) => setPassword(e.target.value)} required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-500 rounded-xl px-4 py-2.5 text-sm">
                                {typeof error === "string" ? error : "Invalid email or password"}
                            </div>
                        )}

                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition disabled:opacity-70"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                            {!loading && <ArrowRight size={16} />}
                        </button>
                    </form>

                    {/* role badges */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <p className="text-xs text-slate-400 text-center mb-3">Portal access for</p>
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                            {[
                                { label: "Admin", cls: "bg-red-50 text-red-600 border-red-200" },
                                { label: "Employee", cls: "bg-blue-50 text-blue-600 border-blue-200" },
                                { label: "Manager", cls: "bg-purple-50 text-purple-600 border-purple-200" },
                                { label: "Finance", cls: "bg-amber-50 text-amber-600 border-amber-200" },
                            ].map((r) => (
                                <span key={r.label} className={`px-3 py-1 rounded-full text-xs font-medium border ${r.cls}`}>
                                    {r.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default LoginPage;
