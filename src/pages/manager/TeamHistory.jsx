import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { History, Search, Plane, DollarSign } from "lucide-react";

const TeamHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = () => {
    apiClient.get("/manager/history").then((res) => {
      setRequests(res.data || []);
    }).catch(() => {
      toast.error("Failed to load");
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = requests.filter((r) => {
    const q = search.toLowerCase();
    return (r.user?.name || "")?.toLowerCase().includes(q) || (r.destination || "")?.toLowerCase().includes(q);
  }).sort((a, b) => (b.id || 0) - (a.id || 0));

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" /></div>;

  const totalBudget = requests.reduce((s, r) => s + (r.budget || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <History className="text-3xl text-slate-700" />
          <h1 className="text-2xl font-bold text-slate-800">Team Travel History</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Trips", value: requests.length, icon: Plane, color: "bg-blue-100 text-blue-600" },
            { label: "Total Budget", value: `₹${totalBudget.toLocaleString()}`, icon: DollarSign, color: "bg-purple-100 text-purple-600" },
            { label: "Avg Budget/Trip", value: `₹${requests.length > 0 ? (totalBudget / requests.length).toLocaleString() : "0"}`, icon: DollarSign, color: "bg-green-100 text-green-600" },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${c.color}`}><c.icon size={20} /></div>
              <div>
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className="text-xl font-bold text-slate-800">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

       
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Travel Records</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 w-48" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="pb-3 pr-4">Employee</th>
                  <th className="pb-3 pr-4">Destination</th>
                  <th className="pb-3 pr-4">Budget</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="py-3.5 pr-4 font-medium text-slate-800">{r.user?.name || "N/A"}</td>
                    <td className="py-3.5 pr-4 text-slate-600">{r.destination || "—"}</td>
                    <td className="py-3.5 pr-4 font-semibold text-slate-700">₹{r.budget?.toLocaleString() || "0"}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        ["COMPLETED", "REIMBURSED"].includes(r.status) ? "bg-green-100 text-green-700" :
                        r.status === "CANCELLED" ? "bg-slate-100 text-slate-700" :
                        r.status === "REJECTED" ? "bg-red-100 text-red-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>{r.status?.replace(/_/g, " ")}</span>
                    </td>
                    <td className="py-3.5 pr-4 text-sm text-slate-400">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan="5" className="text-center text-slate-400 py-8">No history found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamHistory;
