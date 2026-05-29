import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import {
  LayoutDashboard, Users, ShieldCheck, ClipboardList, DollarSign,
  TrendingUp,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#64748b", "#14b8a6", "#6366f1"];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiClient.get("/admin/reports"),
      apiClient.get("/admin/requests"),
    ]).then(([statsRes, requestsRes]) => {
      if (!mounted) return;
      setStats(statsRes.data);
      setAllRequests(requestsRes.data || []);
    }).catch(() => {}).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const recentRequests = allRequests.slice(-5).reverse();

  // Department-wise requests
  const deptMap = {};
  allRequests.forEach((r) => {
    const dept = r.user?.department || r.department || "Unknown";
    if (!deptMap[dept]) deptMap[dept] = 0;
    deptMap[dept]++;
  });
  const deptData = Object.entries(deptMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Pie chart data by status
  const statusCount = {};
  allRequests.forEach((r) => {
    const s = r.status || "DRAFT";
    statusCount[s] = (statusCount[s] || 0) + 1;
  });
  const pieData = Object.entries(statusCount).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));

  const statusColor = {
    DRAFT: "bg-gray-100 text-gray-700", SUBMITTED: "bg-blue-100 text-blue-700",
    POLICY_VALIDATION: "bg-orange-100 text-orange-700", MANAGER_REVIEW: "bg-amber-100 text-amber-700",
    MANAGER_APPROVED: "bg-teal-100 text-teal-700", FINANCE_REVIEW: "bg-purple-100 text-purple-700", FINANCE_APPROVED: "bg-green-100 text-green-700",
    COMPLETED: "bg-emerald-100 text-emerald-700", REJECTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-slate-100 text-slate-700",
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  }

  const cards = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "bg-blue-500" },
    { label: "Total Requests", value: stats?.totalTravelRequests || 0, icon: ClipboardList, color: "bg-indigo-500" },
    { label: "Total Expenses", value: stats?.totalExpenses || 0, icon: DollarSign, color: "bg-green-500" },
    { label: "Total Policies", value: stats?.totalPolicies || 0, icon: ShieldCheck, color: "bg-amber-500" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <LayoutDashboard className="text-3xl text-slate-700" />
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        </div>

        {/* STATS CARDS */}
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

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* BAR CHART — Department-wise Requests */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Users size={20} /> Department Activity
            </h2>
            {deptData.length === 0 ? (
              <p className="text-slate-400 text-center py-12">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptData} layout="vertical" margin={{ left: 100, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90} />
                  <Tooltip formatter={(v) => [`${v} requests`, "Total"]} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 6, 6, 0]} name="Requests" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* PIE CHART — Status Distribution */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp size={20} /> Request Status
            </h2>
            {pieData.length === 0 ? (
              <p className="text-slate-400 text-center py-12">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
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

        {/* RECENT REQUESTS */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} /> Recent Travel Requests
          </h2>
          {recentRequests.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No requests yet</p>
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
                  {recentRequests.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-3 pr-4 font-medium text-slate-800">{r.user?.name || "N/A"}</td>
                      <td className="py-3 pr-4 text-slate-600">{r.destination || "—"}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-700">₹{r.budget?.toLocaleString() || "0"}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[r.status] || "bg-slate-100 text-slate-700"}`}>
                          {r.status?.replace(/_/g, " ")}
                        </span>
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

export default AdminDashboard;
