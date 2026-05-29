import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { Building2, Plus, Edit2, Trash2, X, Users } from "lucide-react";

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [deptName, setDeptName] = useState("");

  const fetchData = () => {
    Promise.all([
      apiClient.get("/admin/department"),
      apiClient.get("/admin/users"),
    ]).then(([deptRes, userRes]) => {
      setDepartments(deptRes.data || []);
      setUsers(userRes.data || []);
    }).catch(() => {
      toast.error("Failed to load data");
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  // Group users by department for mapping display
  const deptUsers = {};
  users.forEach((u) => {
    const d = u.department || "Unassigned";
    if (!deptUsers[d]) deptUsers[d] = [];
    deptUsers[d].push(u);
  });

  // Users not assigned to any department from our list
  const unassignedUsers = users.filter((u) => !u.department);

  const openAdd = () => { setEditDept(null); setDeptName(""); setShowModal(true); };
  const openEdit = (d) => { setEditDept(d); setDeptName(d.name); setShowModal(true); };

  const handleSave = () => {
    if (!deptName.trim()) return toast.error("Department name required");
    const promise = editDept
      ? apiClient.put(`/admin/department/${editDept.id}`, { name: deptName.trim() }).then(() => { setShowModal(false); fetchData(); })
      : apiClient.post("/admin/department", { name: deptName.trim() }).then(() => { setShowModal(false); fetchData(); });
    toast.promise(promise, {
      loading: editDept ? "Updating department..." : "Creating department...",
      success: editDept ? "Department updated" : "Department created",
      error: (err) => err?.response?.data?.message || "Failed to save",
    });
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this department?")) return;
    const promise = apiClient.delete(`/admin/department/${id}`).then(() => fetchData());
    toast.promise(promise, {
      loading: "Deleting department...",
      success: "Deleted",
      error: "Failed to delete",
    });
  };

  const handleMapUser = (userId, deptName) => {
    const promise = apiClient.put(`/admin/users/${userId}`, { department: deptName }).then(() => fetchData());
    toast.promise(promise, {
      loading: "Mapping user...",
      success: "User mapped to department",
      error: "Failed to map user",
    });
  };

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: DEPARTMENTS LIST */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Building2 className="text-3xl text-slate-700" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Departments</h1>
                <p className="text-sm text-slate-400">{departments.length} departments</p>
              </div>
            </div>
            <button onClick={openAdd} className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center gap-2 transition">
              <Plus size={17} /> Add
            </button>
          </div>

          <div className="space-y-3">
            {departments.map((d) => (
              <div key={d.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800 truncate" title={d.name}>{d.name}</h3>
                    <p className="text-xs text-slate-400">{deptUsers[d.name]?.length || 0} employees</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(d)} className="p-2 rounded-xl hover:bg-blue-50 text-blue-600 transition"><Edit2 size={15} /></button>
                    <button onClick={() => handleDelete(d.id)} className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition"><Trash2 size={15} /></button>
                  </div>
                </div>
                {/* Users in this department */}
                {deptUsers[d.name] && deptUsers[d.name].length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {deptUsers[d.name].map((u) => (
                      <span key={u.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg text-xs text-slate-600 border border-slate-200">
                        <Users size={12} />
                        {u.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {departments.length === 0 && <p className="text-center text-slate-400 py-8">No departments yet</p>}
          </div>
        </div>

        {/* RIGHT: MAP USERS TO DEPARTMENTS */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="text-3xl text-slate-700" />
            <div>
              <h2 className="text-xl font-bold text-slate-800">Map Employees</h2>
              <p className="text-sm text-slate-400">Assign users to departments</p>
            </div>
          </div>

          {unassignedUsers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-600 mb-3">Unassigned Users ({unassignedUsers.length})</h3>
              <div className="space-y-2">
                {unassignedUsers.slice(0, 10).map((u) => (
                  <div key={u.id} className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                    <span className="text-sm text-amber-800 truncate block max-w-50" title={`${u.name} (${u.email})`}>{u.name} ({u.email})</span>
                    <select
                      onChange={(e) => e.target.value && handleMapUser(u.id, e.target.value)}
                      className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      <option value="">Assign to...</option>
                      {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All users listed by department */}
          <h3 className="text-sm font-semibold text-slate-600 mb-3">All Employees by Department</h3>
          <div className="space-y-3">
            {departments.map((d) => {
              const members = deptUsers[d.name] || [];
              return (
                <div key={d.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
                  <h4 className="font-medium text-slate-700 text-sm mb-2">{d.name} ({members.length})</h4>
                  {members.length > 0 ? (
                    <div className="space-y-1.5">
                      {members.map((u) => (
                        <div key={u.id} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">{u.name} — <span className="text-slate-400">{u.role}</span></span>
                          <button onClick={() => handleMapUser(u.id, "")} className="text-xs text-red-500 hover:underline">Remove</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No members</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-800">{editDept ? "Edit Department" : "Add Department"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X size={20} /></button>
            </div>
            <input type="text" value={deptName} onChange={(e) => setDeptName(e.target.value)} placeholder="Department name"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4" />
            <button onClick={handleSave} className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition">
              {editDept ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
