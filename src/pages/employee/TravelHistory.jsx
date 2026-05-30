import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { History, Search, Plane, DollarSign, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#64748b", "#ef4444"];

const TravelHistory = () => {
  const [requests, setRequests] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiClient.get("/employee/requests"),
      apiClient.get("/employee/expenses"),
    ]).then(([reqRes, expRes]) => {
      if (!mounted) return;
      const completed = (reqRes.data || []).filter(
        (r) => ["COMPLETED", "REIMBURSED", "TRAVEL_IN_PROGRESS", "CANCELLED", "REJECTED"].includes(r.status)
      );
      setRequests(completed);
      setExpenses(expRes.data || []);
    }).catch(() => {
      if (mounted) toast.error("Failed to load history");
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const filtered = requests.filter((r) => {
    const q = search.toLowerCase();
    return r.destination?.toLowerCase().includes(q) || r.purpose?.toLowerCase().includes(q);
  }).sort((a, b) => (b.id || 0) - (a.id || 0));

  // Charts
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

  const statusCount = {};
  requests.forEach((r) => {
    const s = r.status === "TRAVEL_IN_PROGRESS" ? "In Progress" : r.status === "COMPLETED" ? "Completed" : r.status === "REIMBURSED" ? "Reimbursed" : r.status === "CANCELLED" ? "Cancelled" : r.status === "REJECTED" ? "Rejected" : r.status;
    statusCount[s] = (statusCount[s] || 0) + 1;
  });
  const pieData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

  const totalBudget = requests.reduce((s, r) => s + (r.budget || 0), 0);
  const totalExp = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalTrips = requests.length;

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <History className="text-3xl text-slate-700" />
          <h1 className="text-2xl font-bold text-slate-800">Travel History</h1>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Trips", value: totalTrips, icon: Plane, color: "bg-blue-100 text-blue-600" },
            { label: "Total Budget", value: `₹${totalBudget.toLocaleString()}`, icon: DollarSign, color: "bg-purple-100 text-purple-600" },
            { label: "Total Expenses", value: `₹${totalExp.toLocaleString()}`, icon: DollarSign, color: "bg-green-100 text-green-600" },
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
            {monthlyData.length === 0 ? (
              <p className="text-slate-400 text-center py-12">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="trips" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Trips" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Trip Status Breakdown</h2>
            {pieData.length === 0 ? (
              <p className="text-slate-400 text-center py-12">No data</p>
            ) : (
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

        {/* TRIPS TABLE */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Past Trips</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search destination..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 w-48" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="pb-3 pr-4">Destination</th>
                  <th className="pb-3 pr-4">Purpose</th>
                  <th className="pb-3 pr-4">Budget</th>
                  <th className="pb-3 pr-4">Dates</th>
                  <th className="pb-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="py-3.5 pr-4 font-medium text-slate-800">{r.destination || "—"}</td>
                    <td className="py-3.5 pr-4 text-slate-500 text-sm">{r.purpose || "—"}</td>
                    <td className="py-3.5 pr-4 font-semibold text-slate-700">₹{r.budget?.toLocaleString() || "0"}</td>
                    <td className="py-3.5 pr-4 text-sm text-slate-400">
                      <Calendar size={12} className="inline mr-1" />
                      {r.startDate ? new Date(r.startDate).toLocaleDateString() : "—"} — {r.endDate ? new Date(r.endDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        ["COMPLETED", "REIMBURSED"].includes(r.status) ? "bg-green-100 text-green-700" :
                        r.status === "CANCELLED" ? "bg-slate-100 text-slate-700" :
                        r.status === "REJECTED" ? "bg-red-100 text-red-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>{r.status?.replace(/_/g, " ")}</span>
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

export default TravelHistory;
