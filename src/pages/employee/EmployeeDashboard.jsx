import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import { LayoutDashboard, ClipboardList, Plane, DollarSign, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const STATUS_COLORS = {
  DRAFT: "#94a3b8", SUBMITTED: "#3b82f6", POLICY_VALIDATION: "#f97316", MANAGER_REVIEW: "#f59e0b",
  MANAGER_APPROVED: "#14b8a6", FINANCE_REVIEW: "#a855f7", FINANCE_APPROVED: "#22c55e",
  COMPLETED: "#16a34a", TRAVEL_IN_PROGRESS: "#06b6d4",
  CANCELLED: "#64748b", REJECTED: "#ef4444", REIMBURSED: "#10b981",
};
const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#64748b", "#14b8a6", "#ec4899"];

const EmployeeDashboard = () => {
  const [data, setData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiClient.get("/employee/dashboard"),
      apiClient.get("/employee/requests"),
      apiClient.get("/employee/expenses"),
    ]).then(([dashRes, reqRes, expRes]) => {
      if (!mounted) return;
      setData(dashRes.data);
      setRequests(reqRes.data || []);
      setExpenses(expRes.data || []);
    }).catch(() => {}).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" /></div>;
  }

  const totalExpenseAmt = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const upcoming = requests.filter((r) => r.status === "MANAGER_APPROVED" || r.status === "FINANCE_APPROVED");
  const pending = requests.filter((r) => ["SUBMITTED", "POLICY_VALIDATION", "MANAGER_REVIEW", "FINANCE_REVIEW"].includes(r.status));

  // Monthly bar data
  const monthlyMap = {};
  requests.forEach((r) => {
    if (r.createdAt) {
      const m = new Date(r.createdAt).toLocaleString("default", { month: "short", year: "2-digit" });
      if (!monthlyMap[m]) monthlyMap[m] = { name: m, requests: 0, budget: 0 };
      monthlyMap[m].requests++;
      monthlyMap[m].budget += r.budget || 0;
    }
  });
  const monthlyData = Object.values(monthlyMap).slice(-12);

  // Expense status pie
  const statusCount = {};
  expenses.forEach((e) => {
    const s = e.status || "DRAFT";
    statusCount[s] = (statusCount[s] || 0) + 1;
  });
  const pieData = Object.entries(statusCount).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));

  const cards = [
    { label: "Total Requests", value: data?.totalRequests || requests.length, icon: ClipboardList, color: "bg-blue-500" },
    { label: "Pending Approvals", value: pending.length, icon: Clock, color: "bg-amber-500" },
    { label: "Upcoming Travel", value: upcoming.length, icon: Plane, color: "bg-green-500" },
    { label: "Total Expenses", value: `₹${totalExpenseAmt.toLocaleString()}`, icon: DollarSign, color: "bg-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <LayoutDashboard className="text-3xl text-slate-700" />
          <h1 className="text-3xl font-bold text-slate-800">Employee Dashboard</h1>
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
          {/* BAR — Monthly Requests */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Plane size={20} /> Monthly Requests</h2>
            {monthlyData.length === 0 ? (
              <p className="text-slate-400 text-center py-12">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="requests" fill="#22c55e" radius={[6, 6, 0, 0]} name="Requests" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* PIE — Expense Status */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><DollarSign size={20} /> Expense Status</h2>
            {pieData.length === 0 ? (
              <p className="text-slate-400 text-center py-12">No data</p>
            ) : (
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

        {/* RECENT REQUESTS */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><ClipboardList size={20} /> Recent Requests</h2>
          {requests.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No requests yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="pb-3 pr-4">Destination</th>
                    <th className="pb-3 pr-4">Budget</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.slice(-5).reverse().map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-3 pr-4 font-medium text-slate-800">{r.destination || "—"}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-700">₹{r.budget?.toLocaleString() || "0"}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] ? `bg-${STATUS_COLORS[r.status].replace("#", "")} bg-opacity-10` : "bg-slate-100 text-slate-700"}`}
                          style={{ backgroundColor: STATUS_COLORS[r.status] ? `${STATUS_COLORS[r.status]}20` : "", color: STATUS_COLORS[r.status] || "#64748b" }}>
                          {r.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-400">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</td>
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

export default EmployeeDashboard;
