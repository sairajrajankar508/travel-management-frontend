import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { UserCircle, Save, Lock, Mail, Building2, Shield } from "lucide-react";
import { useSelector } from "react-redux";

const AdminProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", currentPassword: "", newPassword: "" });

  useEffect(() => {
    let mounted = true;
    apiClient.get("/employee/profile").then((res) => {
      if (!mounted) return;
      const data = res.data;
      setProfile(data);
      setForm((prev) => ({ ...prev, name: data.name || "", email: data.email || "" }));
    }).catch(() => {
      if (mounted) toast.error("Failed to load profile");
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const handleUpdate = () => {
    const promise = apiClient.put("/employee/profile/update", {
      name: form.name,
      email: form.email,
      currentPassword: form.currentPassword || undefined,
      newPassword: form.newPassword || undefined,
    }).then(() => {
      setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
      return apiClient.get("/employee/profile");
    }).then((res) => {
      setProfile(res.data);
      setForm((prev) => ({ ...prev, name: res.data.name || "", email: res.data.email || "" }));
    });
    toast.promise(promise, {
      loading: "Updating profile...",
      success: "Profile updated",
      error: (err) => err?.response?.data?.message || "Failed to update profile",
    });
  };

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
       
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-blue-100">
              <UserCircle className="text-4xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{profile?.name || "Admin"}</h1>
              <p className="text-sm text-slate-400">{profile?.email || ""}</p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium flex items-center gap-1.5">
                <Shield size={12} /> ADMIN
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 min-w-0 *:min-w-0 *:wrap-break-word">
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <Building2 size={14} /> Department
              </div>
              <p className="font-semibold text-slate-800 wrap-break-word">{profile?.department || "Administration"}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <Shield size={14} /> Role
              </div>
              <p className="font-semibold text-slate-800 wrap-break-word">{user?.role || "ADMIN"}</p>
            </div>
          </div>
        </div>

       
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <UserCircle size={20} /> Edit Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Mail size={14} className="inline mr-1" /> Email
              </label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>
        </div>

        
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <Lock size={20} /> Change Password
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
              <input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>
        </div>

        
        <div className="flex justify-end">
          <button onClick={handleUpdate} className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2 transition">
            <Save size={17} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
