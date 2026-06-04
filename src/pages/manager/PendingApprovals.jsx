import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { Clock, CheckCircle, XCircle, Search, MessageSquare, Eye, X, MapPinned, Hotel } from "lucide-react";

const PendingApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [comment, setComment] = useState({});
  const [selectedReq, setSelectedReq] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [itinLoading, setItinLoading] = useState(false);

  const fetchPending = () => {
    apiClient.get("/manager/requests").then((res) => {
      setRequests(res.data || []);
    }).catch(() => {
      toast.error("Failed to load");
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => { fetchPending(); }, []);

  const filtered = requests.filter((r) => {
    const q = search.toLowerCase();
    return (r.employeeName || r.user?.name || "")?.toLowerCase().includes(q)
      || (r.destination || "")?.toLowerCase().includes(q);
  }).sort((a, b) => (b.id || 0) - (a.id || 0));

  const handleReview = (id, approve) => {
    const c = comment[id] || "";
    const promise = apiClient.put(`/manager/review/${id}?approve=${approve}&comment=${encodeURIComponent(c)}`).then(() => {
      setComment((prev) => { const n = { ...prev }; delete n[id]; return n; });
      fetchPending();
    });
    toast.promise(promise, {
      loading: approve ? "Approving request..." : "Rejecting request...",
      success: approve ? "Request approved" : "Request rejected",
      error: (err) => err?.response?.data || "Failed to review",
    });
  };

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

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-3xl text-slate-700" />
            <h1 className="text-2xl font-bold text-slate-800">Pending Approvals</h1>
            <span className="ml-auto bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold">{requests.length} pending</span>
          </div>
          <p className="text-slate-500 mb-6">Review and approve/reject employee travel requests</p>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search by employee or destination..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-300 rounded-2xl pl-11 pr-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>

          <div className="space-y-4">
            {filtered.map((r) => (
              <div key={r.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-800">{r.employeeName || r.user?.name || "N/A"}</h3>
                      <span className="text-xs text-slate-400">{r.user?.email || ""}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm min-w-0 *:min-w-0 *:wrap-break-word">
                      <div><span className="text-slate-500">Destination:</span> <span className="font-medium text-slate-700">{r.destination || "—"}</span></div>
                      <div><span className="text-slate-500">Budget:</span> <span className="font-medium text-slate-700">₹{r.budget?.toLocaleString() || "0"}</span></div>
                      <div><span className="text-slate-500">Purpose:</span> <span className="font-medium text-slate-700">{r.purpose || "—"}</span></div>
                      <div><span className="text-slate-500">Status:</span> <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{r.status?.replace(/_/g, " ")}</span></div>
                    </div>
                  </div>
                </div>

               
                <div className="mt-4 flex items-center gap-3">
                  <div className="relative flex-1">
                    <MessageSquare size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Add comment (optional)..." value={comment[r.id] || ""}
                      onChange={(e) => setComment({ ...comment, [r.id]: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  </div>
                  <button onClick={() => { setSelectedReq(r); setItinLoading(true); }} className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-sm font-medium flex items-center gap-1.5 transition" title="View Details">
                    <Eye size={16} /> Details
                  </button>
                  <button onClick={() => handleReview(r.id, true)} className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium flex items-center gap-1.5 transition">
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button onClick={() => handleReview(r.id, false)} className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium flex items-center gap-1.5 transition">
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-slate-400 text-center py-12">No pending approvals</p>}
          </div>
        </div>

       
        {selectedReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedReq(null)}>
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">Employee Request Details</h2>
                <button onClick={() => setSelectedReq(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X size={20} /></button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3 min-w-0 *:min-w-0 *:wrap-break-word">
                  <div><span className="text-slate-500">Employee:</span><p className="font-medium text-slate-800">{selectedReq.employeeName || selectedReq.user?.name || "N/A"}</p></div>
                  <div><span className="text-slate-500">Email:</span><p className="font-medium text-slate-800">{selectedReq.user?.email || "—"}</p></div>
                  <div><span className="text-slate-500">Destination:</span><p className="font-medium text-slate-800">{selectedReq.destination || "—"}</p></div>
                  <div><span className="text-slate-500">Source:</span><p className="font-medium text-slate-800">{selectedReq.source || "—"}</p></div>
                  <div><span className="text-slate-500">Budget:</span><p className="font-medium text-slate-800">₹{selectedReq.budget?.toLocaleString() || "0"}</p></div>
                  <div><span className="text-slate-500">Status:</span><p className="font-medium text-slate-800">{selectedReq.status?.replace(/_/g, " ")}</p></div>
                  <div><span className="text-slate-500">Purpose:</span><p className="font-medium text-slate-800">{selectedReq.purpose || "—"}</p></div>
                  <div><span className="text-slate-500">Start Date:</span><p className="font-medium text-slate-800">{selectedReq.startDate ? new Date(selectedReq.startDate).toLocaleDateString() : "—"}</p></div>
                  <div><span className="text-slate-500">End Date:</span><p className="font-medium text-slate-800">{selectedReq.endDate ? new Date(selectedReq.endDate).toLocaleDateString() : "—"}</p></div>
                  <div><span className="text-slate-500">Transport:</span><p className="font-medium text-slate-800">{selectedReq.transportMode || "—"}</p></div>
                  <div><span className="text-slate-500">Accommodation:</span><p className="font-medium text-slate-800">{selectedReq.accommodation || "—"}</p></div>
                </div>
                {selectedReq.description && (
                  <div><span className="text-slate-500">Description:</span><p className="font-medium text-slate-800 mt-0.5">{selectedReq.description}</p></div>
                )}
                {selectedReq.policyViolated && (
                  <div className="p-3 bg-red-50 rounded-xl">
                    <p className="text-xs font-medium text-red-600">Policy Violation: {selectedReq.policyViolationReason}</p>
                  </div>
                )}
              </div>

             
              <div className="mt-5 pt-4 border-t border-slate-200">
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
    </div>
  );
};

export default PendingApprovals;
