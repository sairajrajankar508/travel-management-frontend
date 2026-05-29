import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { Users, Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const UserManagement = () => {
  const [searchParams] = useSearchParams();
  const roleFilter = searchParams.get("role") || "";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "EMPLOYEE", department: "" });

  const fetchUsers = () => {
    apiClient.get("/admin/users").then((res) => {
      setUsers(res.data || []);
    }).catch(() => {
      toast.error("Failed to load users");
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter((u) => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openAdd = () => { setEditUser(null); setForm({ name: "", email: "", password: "", role: "EMPLOYEE", department: "" }); setShowModal(true); };

  const openEdit = (u) => { setEditUser(u); setForm({ name: u.name, email: u.email, password: "", role: u.role, department: u.department || "" }); setShowModal(true); };

  const handleSave = () => {
    if (!form.name || !form.email) return toast.error("Name and email required");
    if (!editUser && !form.password) return toast.error("Password required");
    const promise = editUser
      ? apiClient.put(`/admin/users/${editUser.id}`, form).then(() => { setShowModal(false); fetchUsers(); })
      : apiClient.post("/admin/create-user", form).then(() => { setShowModal(false); fetchUsers(); });
    toast.promise(promise, {
      loading: editUser ? "Updating user..." : "Creating user...",
      success: editUser ? "User updated" : "User created",
      error: (err) => err?.response?.data?.message || "Failed to save user",
    });
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this user?")) return;
    const promise = apiClient.delete(`/admin/users/${id}`).then(() => fetchUsers());
    toast.promise(promise, {
      loading: "Deleting user...",
      success: "User deleted",
      error: "Failed to delete",
    });
  };

  const toggleStatus = (id) => {
    const promise = apiClient.put(`/admin/users/${id}/toggle-status`).then(() => fetchUsers());
    toast.promise(promise, {
      loading: "Toggling status...",
      success: "Status toggled",
      error: "Failed to toggle",
    });
  };

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="text-3xl text-slate-700" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
                <p className="text-sm text-slate-400">{roleFilter ? `${roleFilter}s` : "All users"} — {filtered.length} found</p>
              </div>
            </div>
            <button onClick={openAdd} className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center gap-2 transition">
              <Plus size={17} /> Add User
            </button>
          </div>

          {/* SEARCH */}
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-300 rounded-2xl pl-11 pr-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3 pr-4">Department</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="py-3.5 pr-4 font-medium text-slate-800">{u.name}</td>
                    <td className="py-3.5 pr-4 text-slate-500">{u.email}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                        u.role === "MANAGER" ? "bg-amber-100 text-amber-700" :
                        u.role === "FINANCE" ? "bg-green-100 text-green-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>{u.role}</span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-500">{u.department || "—"}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {u.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggleStatus(u.id)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition" title="Toggle status">
                          {u.active ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                        </button>
                        <button onClick={() => openEdit(u)} className="p-2 rounded-xl hover:bg-blue-50 text-blue-600 transition" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-slate-400 py-8">No users found</p>}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-800">{editUser ? "Edit User" : "Add User"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password {editUser && "(leave blank to keep)"}</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                  <option value="FINANCE">Finance</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <button onClick={handleSave}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition">
                {editUser ? "Update User" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
