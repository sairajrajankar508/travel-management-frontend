import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import { LayoutDashboard, ClipboardList, Clock, CheckCircle, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7"];

const ManagerDashboard = () => {
  const [data, setData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    Promise.all([
      apiClient.get("/manager/dashboard"),
      apiClient.get("/manager/requests"),
    ]).then(([dashRes, reqRes]) => {
      setData(dashRes.data);
      setRequests(reqRes.data || []);
    }).catch((err) => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" /></div>;

  // Monthly bar data from all requests for chart (use manager history or team-activity for full data)
  const monthlyMap = {};
  requests.forEach((r) => {
    if (r.createdAt) {
      const m = new Date(r.createdAt).toLocaleString("default", { month: "short", year: "2-digit" });
      if (!monthlyMap[m]) monthlyMap[m] = { name: m, requests: 0 };
      monthlyMap[m].requests++;
    }
  });
  const monthlyData = Object.values(monthlyMap).slice(-12);

  // Status pie
  const statusCount = {};
  requests.forEach((r) => {
    const s = r.status || "UNKNOWN";
    statusCount[s] = (statusCount[s] || 0) + 1;
  });
  const pieData = Object.entries(statusCount).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));

  const cards = [
    { label: "Total Team Requests", value: data?.totalRequests || 0, icon: ClipboardList, color: "bg-blue-500" },
    { label: "Pending Approval", value: data?.pendingRequests || 0, icon: Clock, color: "bg-amber-500" },
    { label: "Approved", value: data?.approvedRequests || 0, icon: CheckCircle, color: "bg-green-500" },
    { label: "Total Budget", value: `₹${(data?.totalBudget || 0).toLocaleString()}`, icon: DollarSign, color: "bg-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <LayoutDashboard className="text-3xl text-slate-700" />
          <h1 className="text-3xl font-bold text-slate-800">Manager Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {cards.map((c) => (
            <div key={c.label} className="bg-white rounded-2xl shadow-md border border-slate-200 p-5 flex items-center gap-4">
              <div className={`${c.color} p-3 rounded-xl text-white`}><c.icon size={24} /></div>
              <div>
                <p className="text-sm text-slate-500">{c.label}</p>
                <p className="text-2xl font-bold text-slate-800">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><ClipboardList size={20} /> Monthly Requests</h2>
            {monthlyData.length === 0 ? <p className="text-slate-400 text-center py-12">No data</p> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="requests" fill="#a855f7" radius={[6, 6, 0, 0]} name="Requests" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><DollarSign size={20} /> Request Status</h2>
            {pieData.length === 0 ? <p className="text-slate-400 text-center py-12">No data</p> : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* PENDING REQUESTS PREVIEW */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Clock size={20} /> Pending Requests</h2>
          {requests.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No pending requests</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="pb-3 pr-4">Employee</th>
                    <th className="pb-3 pr-4">Destination</th>
                    <th className="pb-3 pr-4">Budget</th>
                    <th className="pb-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.slice(0, 5).map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-3 pr-4 font-medium text-slate-800">{r.employeeName || r.user?.name || "N/A"}</td>
                      <td className="py-3 pr-4 text-slate-600">{r.destination || "—"}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-700">₹{r.budget?.toLocaleString() || "0"}</td>
                      <td className="py-3 pr-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{r.status?.replace(/_/g, " ")}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
