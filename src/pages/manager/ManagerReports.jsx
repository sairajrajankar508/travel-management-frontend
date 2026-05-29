import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { FileBarChart2, DollarSign, Plane, TrendingUp, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#3b82f6", "#14b8a6"];

const ManagerReports = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" /></div>;

  const totalBudget = requests.reduce((s, r) => s + (r.budget || 0), 0);
  const completed = requests.filter((r) => ["COMPLETED", "REIMBURSED"].includes(r.status)).length;
  const pending = requests.filter((r) => ["SUBMITTED", "POLICY_VALIDATION", "MANAGER_REVIEW", "FINANCE_REVIEW"].includes(r.status)).length;

  // Department spending
  const deptMap = {};
  requests.forEach((r) => {
    const dept = r.user?.department || r.department || "Unknown";
    if (!deptMap[dept]) deptMap[dept] = 0;
    deptMap[dept] += r.budget || 0;
  });
  const deptData = Object.entries(deptMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Monthly budget bar
  const monthlyMap = {};
  requests.forEach((r) => {
    if (r.createdAt) {
      const m = new Date(r.createdAt).toLocaleString("default", { month: "short", year: "2-digit" });
      if (!monthlyMap[m]) monthlyMap[m] = { name: m, budget: 0, requests: 0 };
      monthlyMap[m].budget += r.budget || 0;
      monthlyMap[m].requests++;
    }
  });
  const monthlyData = Object.values(monthlyMap).slice(-12);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <FileBarChart2 className="text-3xl text-slate-700" />
          <h1 className="text-2xl font-bold text-slate-800">Team Reports</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Requests", value: requests.length, icon: Plane, color: "bg-blue-100 text-blue-600" },
            { label: "Completed", value: completed, icon: TrendingUp, color: "bg-green-100 text-green-600" },
            { label: "Pending", value: pending, icon: Users, color: "bg-amber-100 text-amber-600" },
            { label: "Total Budget", value: `₹${totalBudget.toLocaleString()}`, icon: DollarSign, color: "bg-purple-100 text-purple-600" },
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie — Department Spend */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Users size={18} /> Department Spend</h2>
            {deptData.length === 0 ? <p className="text-slate-400 text-center py-12">No data</p> : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={deptData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {deptData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar — Monthly Budget */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp size={18} /> Monthly Budget</h2>
            {monthlyData.length === 0 ? <p className="text-slate-400 text-center py-12">No data</p> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                  <Bar dataKey="budget" fill="#a855f7" radius={[6, 6, 0, 0]} name="Budget" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerReports;
