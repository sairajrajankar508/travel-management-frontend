import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import { User, Save, Lock, Mail, Shield } from "lucide-react";

const FinanceProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: "", email: "", currentPassword: "", newPassword: "", confirmPassword: "" });
    const [msg, setMsg] = useState("");

    useEffect(() => {
        apiClient.get("/finance/profile")
            .then((res) => {
                setProfile(res.data);
                setForm((prev) => ({ ...prev, name: res.data.name || "", email: res.data.email || "" }));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleUpdate = async () => {
        try {
            await apiClient.put("/finance/profile/update", { name: form.name, email: form.email });
            setProfile((prev) => ({ ...prev, ...form }));
            setMsg("Profile updated");
        } catch {
            setMsg("Failed to update");
        }
    };

    const handlePassword = async () => {
        if (form.newPassword !== form.confirmPassword) {
            setMsg("Passwords do not match");
            return;
        }
        try {
            await apiClient.put("/api/auth/change-password", {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            setMsg("Password changed");
            setForm({ ...form, currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch {
            setMsg("Failed to change password");
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" /></div>;

    return (
        <div className="min-h-screen bg-slate-100 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {msg && (
                    <div className="bg-green-100 text-green-700 border border-green-200 rounded-2xl px-5 py-3 text-sm font-medium">{msg}</div>
                )}

                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-2xl bg-amber-100"><User className="text-4xl text-amber-600" /></div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">{profile?.name || "Finance User"}</h1>
                            <p className="text-sm text-slate-400">{profile?.email || ""}</p>
                        </div>
                        <div className="ml-auto">
                            <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium flex items-center gap-1.5">
                                <Shield size={12} /> {profile?.role || "FINANCE"}
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6 min-w-0 *:min-w-0 *:wrap-break-word">
                        <div className="bg-slate-50 rounded-2xl p-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1"><Mail size={14} /> Email</div>
                            <p className="font-semibold text-slate-800">{profile?.email || "—"}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2"><User size={20} /> Edit Profile</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                        </div>
                        <div className="flex justify-end">
                            <button onClick={handleUpdate} className="px-8 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm flex items-center gap-2 transition">
                                <Save size={17} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2"><Lock size={20} /> Change Password</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                            <input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                            <input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                            <input type="password" value={form.confirmPassword || ""} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                        </div>
                        <div className="flex justify-end">
                            <button onClick={handlePassword} className="px-8 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm flex items-center gap-2 transition">
                                <Lock size={17} /> Change Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceProfile;
