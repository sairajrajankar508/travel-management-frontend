import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import { FileBarChart2, TrendingUp, PieChart as PieChartIcon, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const PIE_COLORS = ["#f59e0b", "#22c55e", "#3b82f6", "#ef4444", "#a855f7", "#ec4899"];

const FinanceReports = () => {
    const [deptData, setDeptData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiClient.get("/finance/report"),
            apiClient.get("/finance/category-report"),
            apiClient.get("/finance/monthly-report"),
        ])
        .then(([d, c, m]) => {
            setDeptData(Object.entries(d.data).map(([k, v]) => ({ name: k, value: v })));
            setCategoryData(Object.entries(c.data).map(([k, v]) => ({ name: k, value: v })));
            setMonthlyData(Object.entries(m.data).map(([k, v]) => ({ month: k, amount: v })));
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" /></div>;

    const totalDeptSpend = deptData.reduce((s, d) => s + d.value, 0);
    const totalCategorySpend = categoryData.reduce((s, c) => s + c.value, 0);
    const totalMonthly = monthlyData.reduce((s, m) => s + m.amount, 0);

    const summaryCards = [
        { label: "Department Spend", value: `₹${totalDeptSpend.toFixed(2)}`, icon: Users, color: "bg-blue-100 text-blue-600" },
        { label: "Category Spend", value: `₹${totalCategorySpend.toFixed(2)}`, icon: PieChartIcon, color: "bg-purple-100 text-purple-600" },
        { label: "Monthly Total", value: `₹${totalMonthly.toFixed(2)}`, icon: TrendingUp, color: "bg-green-100 text-green-600" },
        { label: "Reports Generated", value: deptData.length + categoryData.length, icon: FileBarChart2, color: "bg-amber-100 text-amber-600" },
    ];

    return (
        <div className="min-h-screen bg-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <FileBarChart2 className="text-3xl text-slate-700" />
                    <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {summaryCards.map((c) => (
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
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Users size={18} /> Department Spending</h2>
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
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp size={18} /> Monthly Budget vs Spend</h2>
                        {monthlyData.length === 0 ? <p className="text-slate-400 text-center py-12">No data</p> : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={monthlyData}>
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                                    <Bar dataKey="amount" fill="#22c55e" radius={[6, 6, 0, 0]} name="Amount" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><PieChartIcon size={18} /> Expense Category Breakdown</h2>
                    {categoryData.length === 0 ? <p className="text-slate-400 text-center py-12">No data</p> : (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinanceReports;
