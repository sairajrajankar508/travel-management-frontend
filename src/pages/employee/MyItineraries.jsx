import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { MapPinned, Plus, X, Plane, Hotel, Clock, CheckCircle } from "lucide-react";

const MyItineraries = () => {
  const [requests, setRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ dayNumber: 1, location: "", activity: "", hotelName: "", notes: "" });

  useEffect(() => {
    let mounted = true;
    apiClient.get("/employee/requests").then((res) => {
      if (!mounted) return;
      const approved = (res.data || []).filter(
        (r) => !["DRAFT", "SUBMITTED", "REJECTED", "CANCELLED"].includes(r.status)
      );
      setRequests(approved);
      if (approved.length > 0) setSelectedReq(approved[0]);
    }).catch(() => {
      if (mounted) toast.error("Failed to load data");
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const fetchItinerary = (reqId) => {
    apiClient.get(`/itinerary/request/${reqId}`).then((res) => {
      setItinerary(Array.isArray(res.data) ? res.data : []);
    }).catch(() => {
      setItinerary([]);
    });
  };

  useEffect(() => {
    if (selectedReq) fetchItinerary(selectedReq.id);
  }, [selectedReq]);

  const openAddModal = () => {
    const nextDay = itinerary.length > 0
      ? Math.max(...itinerary.map((i) => i.dayNumber || 0)) + 1
      : 1;
    setForm({ dayNumber: nextDay, location: "", activity: "", hotelName: "", notes: "" });
    setShowAdd(true);
  };

  const handleAddItinerary = () => {
    if (!form.location || !form.activity) return toast.error("Location and activity are required");
    const payload = {
      travelRequestId: selectedReq.id,
      dayNumber: form.dayNumber,
      location: form.location,
      activity: form.activity,
      hotelName: form.hotelName,
      notes: form.notes,
    };
    const promise = apiClient.post("/itinerary/add", payload)
      .then((res) => { setShowAdd(false); setSelectedReq((prev) => ({ ...prev, status: "ITINERARY_CREATED" })); fetchItinerary(selectedReq.id); return res; });
    toast.promise(promise, {
      loading: "Adding itinerary...",
      success: (res) => res?.data || "Itinerary added",
      error: (err) => err?.response?.data || "Failed to add itinerary",
    });
  };

  const startTravel = (id) => {
    const promise = apiClient.put(`/itinerary/start/${id}`).then(() => setSelectedReq((prev) => ({ ...prev, status: "TRAVEL_IN_PROGRESS" })));
    toast.promise(promise, {
      loading: "Starting travel...",
      success: "Travel started",
      error: "Failed",
    });
  };

  const completeTravel = (id) => {
    const promise = apiClient.put(`/itinerary/complete/${id}`).then(() => setSelectedReq((prev) => ({ ...prev, status: "COMPLETED" })));
    toast.promise(promise, {
      loading: "Completing travel...",
      success: "Travel completed",
      error: "Failed",
    });
  };

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" /></div>;

  const sorted = [...itinerary].sort((a, b) => (a.dayNumber || 0) - (b.dayNumber || 0));

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — Approved Requests */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <MapPinned className="text-2xl text-slate-700" />
            <h1 className="text-xl font-bold text-slate-800">My Itineraries</h1>
          </div>
          <p className="text-xs text-slate-400 mb-4">Select an approved request to manage its itinerary</p>
          <div className="space-y-2">
            {requests.map((r) => (
              <button key={r.id} onClick={() => setSelectedReq(r)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition border ${
                  selectedReq?.id === r.id ? "bg-green-50 border-green-300" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}>
                <p className="font-medium text-slate-800 truncate">{r.destination || "No destination"}</p>
                <p className="text-xs text-slate-400">₹{r.budget?.toLocaleString()} — {r.status?.replace(/_/g, " ")}</p>
              </button>
            ))}
            {requests.length === 0 && <p className="text-slate-400 text-sm text-center py-8">No approved requests yet</p>}
          </div>
        </div>

        {/* RIGHT — Itinerary Details */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 lg:col-span-2">
          {!selectedReq ? (
            <p className="text-slate-400 text-center py-12">Select a request to view itinerary</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">{selectedReq.destination}</h2>
                <div className="flex gap-2">
                  {selectedReq.status === "FINANCE_APPROVED" && sorted.length === 0 && (
                    <button onClick={openAddModal} className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium flex items-center gap-2 transition">
                      <Plus size={16} /> Add Itinerary
                    </button>
                  )}
                  {sorted.length > 0 && selectedReq.status === "ITINERARY_CREATED" && (
                    <button onClick={() => { openAddModal(); }} className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium flex items-center gap-2 transition">
                      <Plus size={16} /> Add Day
                    </button>
                  )}
                  {sorted.length > 0 && selectedReq.status === "ITINERARY_CREATED" && (
                    <button onClick={() => startTravel(selectedReq.id)} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition">
                      <Plane size={16} className="inline mr-1" /> Start Travel
                    </button>
                  )}
                  {selectedReq.status === "TRAVEL_IN_PROGRESS" && (
                    <button onClick={() => completeTravel(selectedReq.id)} className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition">
                      <CheckCircle size={16} className="inline mr-1" /> Complete Travel
                    </button>
                  )}
                </div>
              </div>

              {/* TIMELINE */}
              {sorted.length > 0 ? (
                <div className="border-l-2 border-green-400 pl-5 space-y-6">
                  {sorted.map((entry) => (
                    <div key={entry.id} className="relative bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="absolute -left-6.25 top-4 w-4 h-4 rounded-full bg-green-400 border-2 border-white" />
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium mb-2">Day {entry.dayNumber}</span>
                          <p className="font-medium text-slate-800">{entry.location}</p>
                          <p className="text-sm text-slate-600 mt-1">{entry.activity}</p>
                        </div>
                        {entry.hotelName && (
                          <div className="text-right">
                            <span className="text-xs text-slate-400 flex items-center gap-1 truncate max-w-45"><Hotel size={12} /> {entry.hotelName}</span>
                          </div>
                        )}
                      </div>
                      {entry.notes && <p className="text-xs text-slate-400 mt-2 italic">{entry.notes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="text-4xl text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400">No itinerary added yet</p>
                  {selectedReq.status === "FINANCE_APPROVED" && (
                    <p className="text-xs text-slate-400 mt-1">Click &quot;Add Itinerary&quot; to plan your trip</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ADD ITINERARY MODAL */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-800">Add Day {form.dayNumber}</h2>
              <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X size={20} /></button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Location *</label>
                <input type="text" placeholder="e.g. Mumbai" value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Hotel</label>
                <input type="text" placeholder="e.g. Taj Hotel" value={form.hotelName}
                  onChange={(e) => setForm({ ...form, hotelName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
            </div>

            <div className="mb-3">
              <label className="text-xs text-slate-500 mb-1 block">Activity *</label>
              <input type="text" placeholder="e.g. Client meeting at office" value={form.activity}
                onChange={(e) => setForm({ ...form, activity: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>

            <div className="mb-5">
              <label className="text-xs text-slate-500 mb-1 block">Notes (optional)</label>
              <textarea placeholder="Any additional notes..." value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" rows="2" />
            </div>

            <button onClick={handleAddItinerary} className="w-full py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition">
              Save Day {form.dayNumber}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyItineraries;
