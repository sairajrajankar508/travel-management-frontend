import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { ShieldCheck, Plus, Edit2, Trash2, X, ToggleLeft, ToggleRight, DollarSign, Plane, Bed, CalendarDays, Utensils, Tag } from "lucide-react";

const PolicyManagement = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPol, setEditPol] = useState(null);
  const [form, setForm] = useState({ policyName: "", description: "", maxBudget: "", allowedClass: "Economy", maxTripDays: "", perDayAllowance: "", hotelLimitPerNight: "" });

  const fetchPolicies = () => {
    apiClient.get("/admin/policy").then((res) => {
      setPolicies(res.data || []);
    }).catch(() => {
      toast.error("Failed to load policies");
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => { fetchPolicies(); }, []);

  const openAdd = () => { setEditPol(null); setForm({ policyName: "", description: "", maxBudget: "", allowedClass: "Economy", maxTripDays: "", perDayAllowance: "", hotelLimitPerNight: "" }); setShowModal(true); };
  const openEdit = (p) => { setEditPol(p); setForm({ policyName: p.policyName || "", description: p.description || "", maxBudget: p.maxBudget?.toString() || "", allowedClass: p.allowedClass || "Economy", maxTripDays: p.maxTripDays?.toString() || "", perDayAllowance: p.perDayAllowance?.toString() || "", hotelLimitPerNight: p.hotelLimitPerNight?.toString() || "" }); setShowModal(true); };

  const handleSave = () => {
    if (!form.policyName) return toast.error("Policy name required");
    if (!form.maxBudget) return toast.error("Budget limit required");
    const payload = {
      policyName: form.policyName,
      description: form.description || undefined,
      maxBudget: parseFloat(form.maxBudget),
      allowedClass: form.allowedClass,
      maxTripDays: form.maxTripDays ? parseInt(form.maxTripDays) : undefined,
      perDayAllowance: form.perDayAllowance ? parseFloat(form.perDayAllowance) : undefined,
      hotelLimitPerNight: form.hotelLimitPerNight ? parseFloat(form.hotelLimitPerNight) : undefined,
    };
    const promise = editPol
      ? apiClient.put(`/admin/policy/${editPol.id}`, payload).then(() => { setShowModal(false); fetchPolicies(); })
      : apiClient.post("/admin/policy", payload).then(() => { setShowModal(false); fetchPolicies(); });
    toast.promise(promise, {
      loading: editPol ? "Updating policy..." : "Creating policy...",
      success: editPol ? "Policy updated" : "Policy created",
      error: (err) => err?.response?.data?.message || "Failed to save",
    });
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this policy?")) return;
    const promise = apiClient.delete(`/admin/policy/${id}`).then(() => fetchPolicies());
    toast.promise(promise, {
      loading: "Deleting policy...",
      success: "Deleted",
      error: "Failed to delete",
    });
  };

  const toggleActive = (id) => {
    const promise = apiClient.put(`/admin/policy/toggle/${id}`).then(() => fetchPolicies());
    toast.promise(promise, {
      loading: "Toggling policy...",
      success: "Toggled",
      error: "Failed to toggle",
    });
  };

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-3xl text-slate-700" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Travel Policies</h1>
                <p className="text-sm text-slate-400">{policies.length} policies configured</p>
              </div>
            </div>
            <button onClick={openAdd} className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center gap-2 transition">
              <Plus size={17} /> Add Policy
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies.map((p) => (
              <div key={p.id} className={`rounded-2xl border p-5 transition ${p.active ? "bg-slate-50 border-slate-200" : "bg-gray-50 border-gray-200 opacity-60"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${p.active ? "bg-blue-100" : "bg-gray-200"}`}>
                      <Plane size={20} className={p.active ? "text-blue-600" : "text-gray-500"} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{p.policyName || p.allowedClass || "Standard"} Class</h3>
                      <p className="text-xs text-slate-400">Policy #{p.id} · {p.allowedClass || "Any"} Class</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggleActive(p.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition" title="Toggle active">
                      {p.active ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                    </button>
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"><Edit2 size={15} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><Trash2 size={15} /></button>
                  </div>
                </div>
                {p.description && <p className="text-sm text-slate-500 mt-2">{p.description}</p>}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <DollarSign size={15} className="text-green-600" />
                    <span className="font-semibold text-slate-700">₹{p.maxBudget?.toLocaleString() || "0"}</span>
                    <span className="text-slate-400">budget</span>
                  </div>
                  {p.maxTripDays && (
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={15} className="text-blue-600" />
                      <span className="font-semibold text-slate-700">{p.maxTripDays}</span>
                      <span className="text-slate-400">days</span>
                    </div>
                  )}
                  {p.perDayAllowance && (
                    <div className="flex items-center gap-1.5">
                      <Utensils size={15} className="text-amber-600" />
                      <span className="font-semibold text-slate-700">₹{p.perDayAllowance}</span>
                      <span className="text-slate-400">/day</span>
                    </div>
                  )}
                  {p.hotelLimitPerNight && (
                    <div className="flex items-center gap-1.5">
                      <Bed size={15} className="text-purple-600" />
                      <span className="font-semibold text-slate-700">₹{p.hotelLimitPerNight}</span>
                      <span className="text-slate-400">/night</span>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${p.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                    {p.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
            {policies.length === 0 && <div className="col-span-2 text-center text-slate-400 py-12">No policies yet</div>}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-800">{editPol ? "Edit Policy" : "Add Policy"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X size={20} /></button>
            </div>
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1"><Tag size={13} className="inline mr-1" /> Policy Name</label>
                <input type="text" value={form.policyName} onChange={(e) => setForm({ ...form, policyName: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="e.g. Standard Domestic" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Brief policy description" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1"><DollarSign size={13} className="inline mr-1" /> Max Budget (₹)</label>
                  <input type="number" value={form.maxBudget} onChange={(e) => setForm({ ...form, maxBudget: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1"><Plane size={13} className="inline mr-1" /> Travel Class</label>
                  <select value={form.allowedClass} onChange={(e) => setForm({ ...form, allowedClass: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="Economy">Economy</option>
                    <option value="Premium Economy">Premium Economy</option>
                    <option value="Business">Business</option>
                    <option value="First Class">First Class</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1"><CalendarDays size={13} className="inline mr-1" /> Max Days</label>
                  <input type="number" value={form.maxTripDays} onChange={(e) => setForm({ ...form, maxTripDays: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Days" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1"><Utensils size={13} className="inline mr-1" /> Per Day (₹)</label>
                  <input type="number" value={form.perDayAllowance} onChange={(e) => setForm({ ...form, perDayAllowance: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="₹/day" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1"><Bed size={13} className="inline mr-1" /> Hotel/Night (₹)</label>
                  <input type="number" value={form.hotelLimitPerNight} onChange={(e) => setForm({ ...form, hotelLimitPerNight: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="₹/night" />
                </div>
              </div>
              <button onClick={handleSave} className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition">
                {editPol ? "Update Policy" : "Create Policy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyManagement;
