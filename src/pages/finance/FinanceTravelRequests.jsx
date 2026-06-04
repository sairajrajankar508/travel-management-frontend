import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { Plane, Search, CheckCircle, XCircle, MessageSquare, Eye, X, Hotel } from "lucide-react";

const FinanceTravelRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [comments, setComments] = useState({});
    const [selectedReq, setSelectedReq] = useState(null);
    const [itinerary, setItinerary] = useState([]);
    const [itinLoading, setItinLoading] = useState(false);

    const fetchRequests = () => {
        apiClient.get("/finance/travel-requests").then((res) => {
            setRequests(res.data || []);
        }).catch((err) => {
            console.error(err);
        }).finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => { fetchRequests(); }, []);

    useEffect(() => {
        if (!selectedReq) return;
        let mounted = true;
        apiClient.get(`/itinerary/request/${selectedReq.id}`).then((res) => {
            if (mounted) setItinerary(Array.isArray(res.data) ? res.data : []);
        }).catch(() => {
            if (mounted) setItinerary([]);
        }).finally(() => {
            if (mounted) setItinLoading(false);
        });
        return () => { mounted = false; };
    }, [selectedReq]);

    const handleApprove = (id) => {
        const promise = apiClient.put(`/finance/travel-approve/${id}`).then(() => fetchRequests());
        toast.promise(promise, {
            loading: "Approving travel request...",
            success: "Travel request approved",
            error: "Failed to approve",
        });
    };

    const handleReject = (id) => {
        const comment = comments[id] || "";
        const promise = apiClient.put(`/finance/travel-reject/${id}`, { comment }).then(() => fetchRequests());
        toast.promise(promise, {
            loading: "Rejecting travel request...",
            success: "Travel request rejected",
            error: "Failed to reject",
        });
    };

    const filtered = requests.filter(
        (r) =>
            (r.destination || "").toLowerCase().includes(search.toLowerCase()) ||
            (r.employeeName || "").toLowerCase().includes(search.toLowerCase()) ||
            (r.purpose || "").toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => (b.id || 0) - (a.id || 0));

    if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" /></div>;

    return (
        <div className="min-h-screen bg-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Plane className="text-3xl text-slate-700" />
                        <h1 className="text-2xl font-bold text-slate-800">Pending Approvals</h1>
                        <span className="ml-auto bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold">{requests.length} pending</span>
                    </div>
                    <p className="text-slate-500 mb-6">Review travel requests, verify budget compliance, check policy violations</p>

                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Search by destination, employee, purpose..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full border border-slate-300 rounded-2xl pl-11 pr-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                    </div>

                    <div className="space-y-4">
                        {filtered.map((req) => (
                            <div key={req.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-slate-800">{req.destination}</h3>
                                            {req.policyViolated && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Policy Violated</span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm min-w-0 *:min-w-0 *:wrap-break-word">
                                            <div><span className="text-slate-500">Employee:</span> <span className="font-medium text-slate-700">{req.employeeName}</span></div>
                                            <div><span className="text-slate-500">Purpose:</span> <span className="font-medium text-slate-700">{req.purpose}</span></div>
                                            <div><span className="text-slate-500">Budget:</span> <span className="font-medium text-slate-700">₹{req.budget}</span></div>
                                            <div><span className="text-slate-500">Status:</span> <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{req.status?.replace(/_/g, " ")}</span></div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-1 min-w-0 *:min-w-0 *:wrap-break-word">
                                            <div><span className="text-slate-500">Dates:</span> <span className="font-medium text-slate-700">{req.startDate ? new Date(req.startDate).toLocaleDateString() : "-"} - {req.endDate ? new Date(req.endDate).toLocaleDateString() : "-"}</span></div>
                                            <div><span className="text-slate-500">Transport:</span> <span className="font-medium text-slate-700">{req.transportMode || "-"}</span></div>
                                            <div><span className="text-slate-500">Accommodation:</span> <span className="font-medium text-slate-700">{req.accommodation || "-"}</span></div>
                                        </div>
                                        {req.policyViolated && req.policyViolationReason && (
                                            <p className="text-xs text-red-500 mt-1">Reason: {req.policyViolationReason}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <MessageSquare size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="text" placeholder="Add comment..." value={comments[req.id] || ""}
                                            onChange={(e) => setComments({ ...comments, [req.id]: e.target.value })}
                                            className="w-full border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                                    </div>
                                    <button onClick={() => { setSelectedReq(req); setItinLoading(true); }} className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-sm font-medium flex items-center gap-1.5 transition" title="View Itinerary">
                                        <Eye size={16} /> Itinerary
                                    </button>
                                    <button onClick={() => handleApprove(req.id)} className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium flex items-center gap-1.5 transition">
                                        <CheckCircle size={16} /> Approve
                                    </button>
                                    <button onClick={() => handleReject(req.id)} className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium flex items-center gap-1.5 transition">
                                        <XCircle size={16} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filtered.length === 0 && <p className="text-slate-400 text-center py-12">No travel requests found</p>}
                    </div>
                </div>
            </div>

           
            {selectedReq && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedReq(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-800">Itinerary — {selectedReq.destination}</h2>
                            <button onClick={() => setSelectedReq(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X size={20} /></button>
                        </div>

                        <div className="text-sm text-slate-500 mb-4 wrap-break-word">
                            Employee: <span className="font-medium text-slate-700">{selectedReq.employeeName}</span>
                            &nbsp;·&nbsp; Budget: <span className="font-medium text-slate-700">₹{selectedReq.budget}</span>
                            &nbsp;·&nbsp; Status: <span className="font-medium text-slate-700">{selectedReq.status?.replace(/_/g, " ")}</span>
                        </div>

                        {itinLoading ? (
                            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600" /></div>
                        ) : itinerary.length > 0 ? (
                            <div className="border-l-2 border-amber-400 pl-4 space-y-3">
                                {[...itinerary].sort((a, b) => (a.dayNumber || 0) - (b.dayNumber || 0)).map((entry) => (
                                    <div key={entry.id} className="relative bg-slate-50 rounded-xl p-3 border border-slate-200">
                                        <div className="absolute -left-5.25 top-3 w-3 h-3 rounded-full bg-amber-400 border-2 border-white" />
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-medium mb-1">Day {entry.dayNumber}</span>
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
                            <p className="text-sm text-slate-400 text-center py-8">No itinerary added yet</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceTravelRequests;
