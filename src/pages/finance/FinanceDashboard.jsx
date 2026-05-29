import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import { LayoutDashboard, Wallet, Clock, CheckCircle, XCircle, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const PIE_COLORS = ["#f59e0b", "#22c55e", "#3b82f6", "#ef4444"];

const FinanceDashboard = () => {
    const [stats, setStats] = useState(null);
    const [monthlyData, setMonthlyData] = useState([]);
    const [requestData, setRequestData] = useState([]);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiClient.get("/finance/dashboard"),
            apiClient.get("/finance/category-report"),
            apiClient.get("/finance/monthly-report"),
            apiClient.get("/finance/monthly-requests-report"),
            apiClient.get("/finance/recent-expenses"),
        ])
        .then(([s, m, mr, r]) => {
            setStats(s.data);
            setMonthlyData(Object.entries(m.data).map(([k, v]) => ({ month: k, amount: v })));
            setRequestData(Object.entries(mr.data).map(([k, v]) => ({ month: k, requests: v })));
            setRecentExpenses(r.data || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" /></div>;

    const cards = stats ? [
        { label: "Total Expenses", value: stats.totalExpenses, icon: Wallet, color: "bg-blue-100 text-blue-600" },
        { label: "Pending", value: stats.pending, icon: Clock, color: "bg-amber-100 text-amber-600" },
        { label: "Approved", value: stats.approved, icon: CheckCircle, color: "bg-green-100 text-green-600" },
        { label: "Reimbursed", value: stats.reimbursed, icon: DollarSign, color: "bg-purple-100 text-purple-600" },
        { label: "Rejected", value: stats.rejected, icon: XCircle, color: "bg-red-100 text-red-600" },
    ] : [];

    const pieData = stats ? [
        { name: "Pending", value: stats.pending || 0 },
        { name: "Approved", value: stats.approved || 0 },
        { name: "Reimbursed", value: stats.reimbursed || 0 },
        { name: "Rejected", value: stats.rejected || 0 },
    ].filter(d => d.value > 0) : [];

    return (
        <div className="min-h-screen bg-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <LayoutDashboard className="text-3xl text-slate-700" />
                    <h1 className="text-2xl font-bold text-slate-800">Finance Dashboard</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-w-0 *:min-w-0">
                    {cards.map((c) => (
                        <div key={c.label} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${c.color}`}><c.icon size={20} /></div>
                            <div>
                                <p className="text-xs text-slate-500">{c.label}</p>
                                <p className="text-xl font-bold text-slate-800">{c.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp size={18} /> Monthly Expense Trend</h2>
                        {monthlyData.length === 0 ? <p className="text-slate-400 text-center py-12">No data</p> : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={monthlyData}>
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                                    <Bar dataKey="amount" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Amount" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Calendar size={18} /> Monthly Requests</h2>
                        {requestData.length === 0 ? <p className="text-slate-400 text-center py-12">No data</p> : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={requestData}>
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="requests" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Requests" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><DollarSign size={18} /> Expense Status</h2>
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

                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Expenses</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="pb-3 pr-4">Title</th>
                                    <th className="pb-3 pr-4">Employee</th>
                                    <th className="pb-3 pr-4">Category</th>
                                    <th className="pb-3 pr-4">Amount</th>
                                    <th className="pb-3 pr-4">Status</th>
                                    <th className="pb-3 pr-4">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentExpenses.map((e) => (
                                    <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                        <td className="py-3.5 pr-4 font-medium text-slate-800">{e.title}</td>
                                        <td className="py-3.5 pr-4 text-slate-600">{e.employeeName}</td>
                                        <td className="py-3.5 pr-4 text-slate-500">{e.category}</td>
                                        <td className="py-3.5 pr-4 font-semibold text-slate-700">₹{e.amount}</td>
                                        <td className="py-3.5 pr-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                e.status === "FINANCE_APPROVED" ? "bg-green-100 text-green-700" :
                                                e.status === "REIMBURSED" ? "bg-purple-100 text-purple-700" :
                                                e.status === "REJECTED" ? "bg-red-100 text-red-700" :
                                                "bg-amber-100 text-amber-700"
                                            }`}>{e.status?.replace(/_/g, " ")}</span>
                                        </td>
                                        <td className="py-3.5 pr-4 text-sm text-slate-400">{e.actionDate ? new Date(e.actionDate).toLocaleDateString() : "-"}</td>
                                    </tr>
                                ))}
                                {recentExpenses.length === 0 && <tr><td colSpan={6} className="text-center text-slate-400 py-8">No expenses found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceDashboard;
