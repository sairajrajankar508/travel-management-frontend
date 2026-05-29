import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { ClipboardList, Search, Filter, ChevronDown, Eye, X, MapPinned, Hotel } from "lucide-react";

const STATUS_BADGE = {
  DRAFT: "bg-gray-100 text-gray-700", SUBMITTED: "bg-blue-100 text-blue-700",
  POLICY_VALIDATION: "bg-orange-100 text-orange-700", MANAGER_REVIEW: "bg-amber-100 text-amber-700", MANAGER_APPROVED: "bg-teal-100 text-teal-700",
  FINANCE_REVIEW: "bg-purple-100 text-purple-700", FINANCE_APPROVED: "bg-green-100 text-green-700",
  ITINERARY_CREATED: "bg-indigo-100 text-indigo-700", TRAVEL_IN_PROGRESS: "bg-cyan-100 text-cyan-700",
  COMPLETED: "bg-green-100 text-green-700", CANCELLED: "bg-slate-100 text-slate-700", REJECTED: "bg-red-100 text-red-700",
};

const TeamRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [itinLoading, setItinLoading] = useState(false);

  const fetchData = () => {
    apiClient.get("/manager/team-activity").then((res) => {
      setRequests(res.data || []);
    }).catch(() => {
      toast.error("Failed to load");
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const fetchItinerary = (reqId) => {
    apiClient.get(`/itinerary/request/${reqId}`).then((res) => {
      setItinerary(Array.isArray(res.data) ? res.data : []);
    }).catch(() => {
      setItinerary([]);
    }).finally(() => {
      setItinLoading(false);
    });
  };

  useEffect(() => {
    if (selectedReq) fetchItinerary(selectedReq.id);
  }, [selectedReq]);

  const filtered = requests.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = (r.employeeName || r.user?.name || "")?.toLowerCase().includes(q)
      || (r.destination || "")?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ClipboardList className="text-3xl text-slate-700" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Team Travel Requests</h1>
                <p className="text-sm text-slate-400">{filtered.length} requests from your team</p>
              </div>
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2.5 rounded-2xl border text-sm font-medium flex items-center gap-2 transition ${showFilters ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
              <Filter size={16} /> Filters <ChevronDown size={14} />
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search by employee or destination..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-300 rounded-2xl pl-11 pr-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>

          {showFilters && (
            <div className="mb-5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-sm font-medium text-slate-600 mb-1">Filter by Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 w-full max-w-xs">
                <option value="">All Statuses</option>
                {["SUBMITTED", "POLICY_VALIDATION", "MANAGER_REVIEW", "MANAGER_APPROVED", "FINANCE_REVIEW", "FINANCE_APPROVED", "COMPLETED", "CANCELLED", "REJECTED"].map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="pb-3 pr-4">Employee</th>
                  <th className="pb-3 pr-4">Destination</th>
                  <th className="pb-3 pr-4">Purpose</th>
                  <th className="pb-3 pr-4">Budget</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="py-3.5 pr-4 font-medium text-slate-800">{r.employeeName || r.user?.name || "N/A"}</td>
                    <td className="py-3.5 pr-4 text-slate-600">{r.destination || "—"}</td>
                    <td className="py-3.5 pr-4 text-slate-500 text-sm">{r.purpose || "—"}</td>
                    <td className="py-3.5 pr-4 font-semibold text-slate-700">₹{r.budget?.toLocaleString() || "0"}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[r.status] || "bg-slate-100 text-slate-700"}`}>
                        {r.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-sm text-slate-400">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="py-3.5 pr-4">
                      <button onClick={() => { setSelectedReq(r); setItinLoading(true); }} className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-medium flex items-center gap-1 transition">
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan="7" className="text-center text-slate-400 py-8">No requests found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* VIEW DETAILS + ITINERARY MODAL */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedReq(null)}>
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">Request Details</h2>
              <button onClick={() => setSelectedReq(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X size={20} /></button>
            </div>

            {/* Request Info */}
            <div className="space-y-3 text-sm mb-4">
              <div className="grid grid-cols-2 gap-3 min-w-0 *:min-w-0 *:wrap-break-word">
                <div><span className="text-slate-500">Employee:</span><p className="font-medium text-slate-800">{selectedReq.employeeName || selectedReq.user?.name || "N/A"}</p></div>
                <div><span className="text-slate-500">Destination:</span><p className="font-medium text-slate-800">{selectedReq.destination || "—"}</p></div>
                <div><span className="text-slate-500">Budget:</span><p className="font-medium text-slate-800">₹{selectedReq.budget?.toLocaleString() || "0"}</p></div>
                <div><span className="text-slate-500">Status:</span><p className="font-medium text-slate-800">{selectedReq.status?.replace(/_/g, " ")}</p></div>
                <div><span className="text-slate-500">Purpose:</span><p className="font-medium text-slate-800">{selectedReq.purpose || "—"}</p></div>
                <div><span className="text-slate-500">Dates:</span><p className="font-medium text-slate-800">{selectedReq.startDate ? new Date(selectedReq.startDate).toLocaleDateString() : ""} - {selectedReq.endDate ? new Date(selectedReq.endDate).toLocaleDateString() : ""}</p></div>
              </div>
            </div>

            {/* Itinerary */}
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-600 flex items-center gap-2 mb-3"><MapPinned size={15} /> Itinerary</h3>
              {itinLoading ? (
                <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" /></div>
              ) : itinerary.length > 0 ? (
                <div className="border-l-2 border-purple-400 pl-4 space-y-3">
                  {[...itinerary].sort((a, b) => (a.dayNumber || 0) - (b.dayNumber || 0)).map((entry) => (
                    <div key={entry.id} className="relative bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <div className="absolute -left-5.25 top-3 w-3 h-3 rounded-full bg-purple-400 border-2 border-white" />
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs font-medium mb-1">Day {entry.dayNumber}</span>
                          <p className="font-medium text-slate-800 text-sm">{entry.location}</p>
                          <p className="text-xs text-slate-600">{entry.activity}</p>
                        </div>
                        {entry.hotelName && <span className="text-xs text-slate-400 flex items-center gap-1"><Hotel size={12} /> {entry.hotelName}</span>}
                      </div>
                      {entry.notes && <p className="text-xs text-slate-400 mt-1 italic">{entry.notes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-3">No itinerary added yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamRequests;
