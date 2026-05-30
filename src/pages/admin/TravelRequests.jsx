import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { ClipboardList, Search, Filter, ChevronDown } from "lucide-react";

const statuses = [
  "SUBMITTED", "POLICY_VALIDATION", "MANAGER_REVIEW", "MANAGER_APPROVED", "FINANCE_REVIEW",
  "FINANCE_APPROVED", "ITINERARY_CREATED", "TRAVEL_IN_PROGRESS",
  "EXPENSE_SUBMITTED", "EXPENSE_REVIEW", "REIMBURSED", "COMPLETED",
  "CANCELLED", "REJECTED", "DRAFT",
];

const statusColor = {
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  POLICY_VALIDATION: "bg-orange-100 text-orange-700", MANAGER_REVIEW: "bg-amber-100 text-amber-700",
  MANAGER_APPROVED: "bg-teal-100 text-teal-700",
  FINANCE_REVIEW: "bg-purple-100 text-purple-700",
  FINANCE_APPROVED: "bg-green-100 text-green-700",
  ITINERARY_CREATED: "bg-indigo-100 text-indigo-700",
  TRAVEL_IN_PROGRESS: "bg-cyan-100 text-cyan-700",
  EXPENSE_SUBMITTED: "bg-pink-100 text-pink-700",
  EXPENSE_REVIEW: "bg-rose-100 text-rose-700",
  REIMBURSED: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-slate-100 text-slate-700",
  REJECTED: "bg-red-100 text-red-700",
};

const TravelRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [overrideId, setOverrideId] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState("");

  const fetchRequests = () => {
    apiClient.get("/admin/requests").then((res) => {
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
    const matchSearch = r.user?.name?.toLowerCase().includes(q) || r.destination?.toLowerCase().includes(q) || r.purpose?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => (b.id || 0) - (a.id || 0));

  const handleOverride = (id) => {
    if (!overrideStatus) return toast.error("Select a status");
    const promise = apiClient.put(`/admin/requests/override/${id}?status=${overrideStatus}`).then(() => {
      setOverrideId(null);
      setOverrideStatus("");
      fetchRequests();
    });
    toast.promise(promise, {
      loading: "Updating status...",
      success: "Status updated",
      error: "Failed to update",
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
              <ClipboardList className="text-3xl text-slate-700" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Travel Requests</h1>
                <p className="text-sm text-slate-400">{filtered.length} requests found</p>
              </div>
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2.5 rounded-2xl border text-sm font-medium flex items-center gap-2 transition ${showFilters ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
              <Filter size={16} /> Filters <ChevronDown size={14} />
            </button>
          </div>

          {/* SEARCH + FILTERS */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search by employee, destination, or purpose..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-300 rounded-2xl pl-11 pr-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          {showFilters && (
            <div className="mb-5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-sm font-medium text-slate-600 mb-1">Filter by Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full max-w-xs">
                <option value="">All Statuses</option>
                {statuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </div>
          )}

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="pb-3 pr-4">Employee</th>
                  <th className="pb-3 pr-4">Destination</th>
                  <th className="pb-3 pr-4">Purpose</th>
                  <th className="pb-3 pr-4">Budget</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="py-3.5 pr-4 font-medium text-slate-800">{r.user?.name || "N/A"}</td>
                    <td className="py-3.5 pr-4 text-slate-600">{r.destination || "—"}</td>
                    <td className="py-3.5 pr-4 text-slate-500 text-sm">{r.purpose || "—"}</td>
                    <td className="py-3.5 pr-4 font-semibold text-slate-700">₹{r.budget?.toLocaleString() || "0"}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[r.status] || "bg-slate-100 text-slate-700"}`}>
                        {r.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {overrideId === r.id ? (
                        <div className="flex items-center gap-2 justify-end">
                          <select value={overrideStatus} onChange={(e) => setOverrideStatus(e.target.value)}
                            className="border border-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400">
                            <option value="">Select...</option>
                            {statuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                          </select>
                          <button onClick={() => handleOverride(r.id)} className="px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition">Save</button>
                          <button onClick={() => setOverrideId(null)} className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs transition">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setOverrideId(r.id)} className="px-4 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium transition">Override</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-slate-400 py-12">No requests match your filters</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelRequests;
