import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { History, Search, Plane, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const PIE_COLORS = ["#22c55e", "#14b8a6", "#3b82f6", "#f59e0b", "#ef4444", "#64748b"];

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

  // Monthly bar chart
  const monthlyMap = {};
  requests.forEach((r) => {
    if (r.createdAt) {
      const m = new Date(r.createdAt).toLocaleString("default", { month: "short", year: "2-digit" });
      if (!monthlyMap[m]) monthlyMap[m] = { name: m, trips: 0, budget: 0 };
      monthlyMap[m].trips++;
      monthlyMap[m].budget += r.budget || 0;
    }
  });
  const monthlyData = Object.values(monthlyMap).slice(-12);

  // Status pie
  const statusCount = {};
  requests.forEach((r) => {
    const s = r.status === "COMPLETED" ? "Completed" : r.status === "REIMBURSED" ? "Reimbursed" : r.status === "CANCELLED" ? "Cancelled" : r.status === "REJECTED" ? "Rejected" : r.status === "MANAGER_APPROVED" ? "Approved" : r.status?.replace(/_/g, " ") || "Other";
    statusCount[s] = (statusCount[s] || 0) + 1;
  });
  const pieData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

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

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Plane size={18} /> Trips per Month</h2>
            {monthlyData.length === 0 ? <p className="text-slate-400 text-center py-12">No data</p> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="trips" fill="#a855f7" radius={[6, 6, 0, 0]} name="Trips" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Request Outcomes</h2>
            {pieData.length === 0 ? <p className="text-slate-400 text-center py-12">No data</p> : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* TABLE */}
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
