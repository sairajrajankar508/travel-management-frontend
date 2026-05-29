import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { ClipboardList, Plus, Search, X, Send, Save, Trash2, Eye } from "lucide-react";

const STATUS_BADGE = {
  DRAFT: "bg-gray-100 text-gray-700", SUBMITTED: "bg-blue-100 text-blue-700",
  POLICY_VALIDATION: "bg-orange-100 text-orange-700", MANAGER_REVIEW: "bg-amber-100 text-amber-700", MANAGER_APPROVED: "bg-teal-100 text-teal-700",
  FINANCE_REVIEW: "bg-purple-100 text-purple-700", FINANCE_APPROVED: "bg-green-100 text-green-700",
  ITINERARY_CREATED: "bg-indigo-100 text-indigo-700", TRAVEL_IN_PROGRESS: "bg-cyan-100 text-cyan-700",
  EXPENSE_SUBMITTED: "bg-pink-100 text-pink-700", EXPENSE_REVIEW: "bg-rose-100 text-rose-700",
  REIMBURSED: "bg-emerald-100 text-emerald-700", COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-slate-100 text-slate-700", REJECTED: "bg-red-100 text-red-700",
};

const TravelRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [form, setForm] = useState({
    source: "", destination: "", startDate: "", endDate: "",
    budget: "", transportMode: "Flight", accommodation: "Hotel",
    purpose: "", description: "",
  });

  const fetchRequests = () => {
    apiClient.get("/employee/requests").then((res) => {
      setRequests(res.data || []);
    }).catch(() => {
      toast.error("Failed to load requests");
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => { fetchRequests(); }, []);

  const filtered = requests.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = r.destination?.toLowerCase().includes(q) || r.purpose?.toLowerCase().includes(q);
    if (tab === "all") return matchSearch;
    if (tab === "draft") return matchSearch && r.status === "DRAFT";
    if (tab === "pending") return matchSearch && ["SUBMITTED", "POLICY_VALIDATION", "MANAGER_REVIEW", "FINANCE_REVIEW"].includes(r.status);
    if (tab === "approved") return matchSearch && ["MANAGER_APPROVED", "FINANCE_APPROVED", "ITINERARY_CREATED", "TRAVEL_IN_PROGRESS"].includes(r.status);
    if (tab === "completed") return matchSearch && ["COMPLETED", "REIMBURSED"].includes(r.status);
    return matchSearch;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      budget: parseFloat(form.budget) || 0,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    };
    const promise = apiClient.post("/employee/request", payload).then(() => {
      setShowForm(false);
      setForm({ source: "", destination: "", startDate: "", endDate: "", budget: "", transportMode: "Flight", accommodation: "Hotel", purpose: "", description: "" });
      fetchRequests();
    });
    toast.promise(promise, {
      loading: "Submitting request...",
      success: "Request submitted for approval",
      error: (err) => err?.response?.data?.message || "Failed to submit",
    });
  };

  const saveDraft = () => {
    const payload = {
      ...form,
      budget: parseFloat(form.budget) || 0,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    };
    const promise = apiClient.post("/employee/request", payload).then(() => { setShowForm(false); fetchRequests(); });
    toast.promise(promise, {
      loading: "Saving draft...",
      success: "Draft saved",
      error: "Failed to save draft",
    });
  };

  const submitRequest = (id) => {
    const promise = apiClient.put(`/employee/submit/${id}`).then(() => fetchRequests());
    toast.promise(promise, {
      loading: "Submitting...",
      success: "Submitted!",
      error: "Failed to submit",
    });
  };

  const cancelRequest = (id) => {
    if (!confirm("Cancel this request?")) return;
    const promise = apiClient.put(`/employee/cancel/${id}`).then(() => fetchRequests());
    toast.promise(promise, {
      loading: "Cancelling...",
      success: "Cancelled",
      error: "Failed to cancel",
    });
  };

  const deleteRequest = (id) => {
    if (!confirm("Delete this request?")) return;
    const promise = apiClient.delete(`/employee/delete/${id}`).then(() => fetchRequests());
    toast.promise(promise, {
      loading: "Deleting...",
      success: "Deleted",
      error: "Failed to delete",
    });
  };

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ClipboardList className="text-3xl text-slate-700" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Travel Requests</h1>
                <p className="text-sm text-slate-400">{filtered.length} requests</p>
              </div>
            </div>
            <button onClick={() => setShowForm(true)} className="px-5 py-2.5 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-medium text-sm flex items-center gap-2 transition">
              <Plus size={17} /> New Request
            </button>
          </div>

          {/* TABS + SEARCH */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            {["all", "draft", "pending", "approved", "completed"].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize ${
                  tab === t ? "bg-green-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>{t}</button>
            ))}
            <div className="relative ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 w-48" />
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="pb-3 pr-4">Destination</th>
                  <th className="pb-3 pr-4">Budget</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="py-3.5 pr-4 font-medium text-slate-800">{r.destination || "—"}</td>
                    <td className="py-3.5 pr-4 font-semibold text-slate-700">₹{r.budget?.toLocaleString() || "0"}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[r.status] || "bg-slate-100 text-slate-700"}`}>
                        {r.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-sm text-slate-400">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {r.status === "DRAFT" && (
                          <>
                            <button onClick={() => submitRequest(r.id)} className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition" title="Submit"><Send size={15} /></button>
                            <button onClick={() => deleteRequest(r.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition" title="Delete"><Trash2 size={15} /></button>
                          </>
                        )}
                        {!["DRAFT", "COMPLETED", "CANCELLED", "REJECTED"].includes(r.status) && (
                          <button onClick={() => cancelRequest(r.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition" title="Cancel"><X size={15} /></button>
                        )}
                        <button onClick={() => setSelectedReq(r)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition" title="View Details"><Eye size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-slate-400 py-8">No requests found</p>}
          </div>
        </div>

        {/* VIEW DETAILS MODAL */}
        {selectedReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedReq(null)}>
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">Request Details</h2>
                <button onClick={() => setSelectedReq(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X size={20} /></button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3 min-w-0 *:min-w-0 *:wrap-break-word">
                  <div><span className="text-slate-500">Destination:</span><p className="font-medium text-slate-800 wrap-break-word">{selectedReq.destination || "—"}</p></div>
                  <div><span className="text-slate-500">Source:</span><p className="font-medium text-slate-800 wrap-break-word">{selectedReq.source || "—"}</p></div>
                  <div><span className="text-slate-500">Budget:</span><p className="font-medium text-slate-800">₹{selectedReq.budget?.toLocaleString() || "0"}</p></div>
                  <div><span className="text-slate-500">Status:</span><p className="font-medium text-slate-800">{selectedReq.status?.replace(/_/g, " ")}</p></div>
                  <div><span className="text-slate-500">Start Date:</span><p className="font-medium text-slate-800">{selectedReq.startDate ? new Date(selectedReq.startDate).toLocaleDateString() : "—"}</p></div>
                  <div><span className="text-slate-500">End Date:</span><p className="font-medium text-slate-800">{selectedReq.endDate ? new Date(selectedReq.endDate).toLocaleDateString() : "—"}</p></div>
                  <div><span className="text-slate-500">Transport:</span><p className="font-medium text-slate-800">{selectedReq.transportMode || "—"}</p></div>
                  <div><span className="text-slate-500">Accommodation:</span><p className="font-medium text-slate-800 wrap-break-word">{selectedReq.accommodation || "—"}</p></div>
                  <div><span className="text-slate-500">Purpose:</span><p className="font-medium text-slate-800 wrap-break-word">{selectedReq.purpose || "—"}</p></div>
                </div>
                {selectedReq.description && (
                  <div><span className="text-slate-500">Description:</span><p className="font-medium text-slate-800 mt-0.5 wrap-break-word">{selectedReq.description}</p></div>
                )}
                {selectedReq.policyViolated && (
                  <div className="p-3 bg-red-50 rounded-xl">
                    <p className="text-xs font-medium text-red-600 wrap-break-word">Policy Violation: {selectedReq.policyViolationReason}</p>
                  </div>
                )}
                {selectedReq.managerComment && (
                  <div><span className="text-slate-500">Manager Comment:</span><p className="font-medium text-slate-800 mt-0.5 wrap-break-word">{selectedReq.managerComment}</p></div>
                )}
                {selectedReq.financeComment && (
                  <div><span className="text-slate-500">Finance Comment:</span><p className="font-medium text-slate-800 mt-0.5 wrap-break-word">{selectedReq.financeComment}</p></div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* CREATE REQUEST MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-6" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-2xl mx-4 my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-800">New Travel Request</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
                  <input type="text" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
                  <input type="text" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Budget (₹)</label>
                  <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Transport</label>
                  <select value={form.transportMode} onChange={(e) => setForm({ ...form, transportMode: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                    <option>Flight</option><option>Train</option><option>Bus</option><option>Cab</option><option>Own Vehicle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Accommodation</label>
                  <select value={form.accommodation} onChange={(e) => setForm({ ...form, accommodation: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                    <option>Hotel</option><option>Guest House</option><option>Serviced Apt</option><option>None</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Purpose of Travel</label>
                <input type="text" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={saveDraft} className="px-6 py-2.5 rounded-2xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition flex items-center gap-2">
                  <Save size={16} /> Save Draft
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-medium text-sm flex items-center gap-2 transition">
                  <Send size={16} /> Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelRequests;
