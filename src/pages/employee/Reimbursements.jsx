import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { DollarSign, CheckCircle, Clock, Search } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const STATUS_BADGE = {
  FINANCE_APPROVED: "bg-green-100 text-green-700",
  REIMBURSED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

const PIE_COLORS = ["#22c55e", "#10b981", "#ef4444", "#f59e0b"];

const Reimbursements = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  useEffect(() => {
    let mounted = true;
    apiClient.get("/employee/expenses").then((res) => {
      if (!mounted) return;
      const relevant = (res.data || []).filter(
        (e) => ["FINANCE_APPROVED", "REIMBURSED", "REJECTED"].includes(e.status)
      );
      setExpenses(relevant);
    }).catch(() => {
      if (mounted) toast.error("Failed to load data");
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const filtered = expenses.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = e.title?.toLowerCase().includes(q);
    if (tab === "all") return matchSearch;
    if (tab === "approved") return matchSearch && e.status === "FINANCE_APPROVED";
    if (tab === "reimbursed") return matchSearch && e.status === "REIMBURSED";
    if (tab === "rejected") return matchSearch && e.status === "REJECTED";
    return matchSearch;
  }).sort((a, b) => (b.id || 0) - (a.id || 0));

  // Charts
  const statusCount = {};
  expenses.forEach((e) => {
    const s = e.status === "FINANCE_APPROVED" ? "Approved" : e.status === "REIMBURSED" ? "Reimbursed" : e.status === "REJECTED" ? "Rejected" : e.status;
    statusCount[s] = (statusCount[s] || 0) + 1;
  });
  const pieData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

  const monthlyMap = {};
  expenses.forEach((e) => {
    if (e.expenseDate) {
      const m = new Date(e.expenseDate).toLocaleString("default", { month: "short", year: "2-digit" });
      if (!monthlyMap[m]) monthlyMap[m] = { name: m, amount: 0, count: 0 };
      monthlyMap[m].amount += e.amount || 0;
      monthlyMap[m].count++;
    }
  });
  const monthlyData = Object.values(monthlyMap).slice(-12);

  const totalApproved = expenses.filter((e) => e.status === "FINANCE_APPROVED" || e.status === "REIMBURSED").reduce((s, e) => s + (e.amount || 0), 0);
  const totalReimbursed = expenses.filter((e) => e.status === "REIMBURSED").reduce((s, e) => s + (e.amount || 0), 0);
  const pendingAmount = expenses.filter((e) => e.status === "FINANCE_APPROVED").reduce((s, e) => s + (e.amount || 0), 0);

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <DollarSign className="text-3xl text-slate-700" />
          <h1 className="text-2xl font-bold text-slate-800">Reimbursements</h1>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Approved Amount", value: `₹${totalApproved.toLocaleString()}`, color: "bg-green-100 text-green-600", icon: CheckCircle },
            { label: "Reimbursed", value: `₹${totalReimbursed.toLocaleString()}`, color: "bg-emerald-100 text-emerald-600", icon: DollarSign },
            { label: "Pending Payout", value: `₹${pendingAmount.toLocaleString()}`, color: "bg-amber-100 text-amber-600", icon: Clock },
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

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Reimbursement Status</h2>
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
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Monthly Amount</h2>
            {monthlyData.length === 0 ? (
              <p className="text-slate-400 text-center py-12">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* EXPENSES TABLE */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {["all", "approved", "reimbursed", "rejected"].map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize ${
                    tab === t ? "bg-green-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}>{t}</button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 w-48" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="pb-3 pr-4">Title</th>
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="py-3.5 pr-4 font-medium text-slate-800">{e.title}</td>
                    <td className="py-3.5 pr-4 text-slate-500 text-sm">{e.category || "—"}</td>
                    <td className="py-3.5 pr-4 font-semibold text-slate-700">₹{e.amount?.toLocaleString() || "0"}</td>
                    <td className="py-3.5 pr-4 text-sm text-slate-400">{e.expenseDate ? new Date(e.expenseDate).toLocaleDateString() : "—"}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[e.status] || "bg-slate-100 text-slate-700"}`}>
                        {e.status === "FINANCE_APPROVED" ? "Approved" : e.status === "REIMBURSED" ? "Reimbursed" : e.status === "REJECTED" ? "Rejected" : e.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan="5" className="text-center text-slate-400 py-8">No records found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reimbursements;
