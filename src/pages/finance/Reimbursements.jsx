import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { Wallet, CheckCircle, Clock, DollarSign, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const PIE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];

const Reimbursements = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pending");

    const fetchData = () => {
        apiClient.get("/finance/payment-history").then((res) => {
            setExpenses(res.data || []);
        }).catch((err) => {
            console.error(err);
        }).finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => { fetchData(); }, []);

    const handleReimburse = (id) => {
        const promise = apiClient.put(`/finance/reimburse/${id}`).then(() => fetchData());
        toast.promise(promise, {
            loading: "Processing reimbursement...",
            success: "Reimbursement completed",
            error: "Failed to reimburse",
        });
    };

    const approved = expenses.filter((e) => e.status === "FINANCE_APPROVED");
    const reimbursed = expenses.filter((e) => e.status === "REIMBURSED");
    const rejected = expenses.filter((e) => e.status === "REJECTED");

    const displayExpenses = (activeTab === "pending" ? approved : activeTab === "reimbursed" ? reimbursed : rejected).sort((a, b) => (b.id || 0) - (a.id || 0));

    const totalApproved = approved.reduce((s, e) => s + e.amount, 0);
    const totalReimbursed = reimbursed.reduce((s, e) => s + e.amount, 0);
    const totalRejected = rejected.reduce((s, e) => s + e.amount, 0);

    const pieData = [
        { name: "Approved", value: approved.length },
        { name: "Reimbursed", value: reimbursed.length },
        { name: "Rejected", value: rejected.length },
    ].filter(d => d.value > 0);

    if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" /></div>;

    return (
        <div className="min-h-screen bg-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Wallet className="text-3xl text-slate-700" />
                    <h1 className="text-2xl font-bold text-slate-800">Reimbursements</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: "Approved to Pay", value: approved.length, amount: `₹${totalApproved.toFixed(2)}`, icon: Clock, color: "bg-blue-100 text-blue-600" },
                        { label: "Reimbursed", value: reimbursed.length, amount: `₹${totalReimbursed.toFixed(2)}`, icon: CheckCircle, color: "bg-green-100 text-green-600" },
                        { label: "Rejected", value: rejected.length, amount: `₹${totalRejected.toFixed(2)}`, icon: DollarSign, color: "bg-red-100 text-red-600" },
                    ].map((c) => (
                        <div key={c.label} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${c.color}`}><c.icon size={20} /></div>
                            <div>
                                <p className="text-xs text-slate-500">{c.label}</p>
                                <p className="text-xl font-bold text-slate-800">{c.value}</p>
                                <p className="text-sm font-semibold text-slate-600">{c.amount}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp size={18} /> Reimbursement Overview</h2>
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

                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
                    <div className="flex gap-2 border-b border-slate-200 pb-3 mb-4">
                        {["pending", "reimbursed", "rejected"].map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 rounded-t-lg font-medium text-sm transition ${
                                    activeTab === tab ? "bg-amber-100 text-amber-700 border-b-2 border-amber-500" : "text-slate-500 hover:text-slate-700"
                                }`}>
                                {tab === "pending" ? `Approved (${approved.length})` : `${tab.charAt(0).toUpperCase() + tab.slice(1)} (${(tab === "reimbursed" ? reimbursed : rejected).length})`}
                            </button>
                        ))}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="pb-3 pr-4">Title</th>
                                    <th className="pb-3 pr-4">Employee</th>
                                    <th className="pb-3 pr-4">Category</th>
                                    <th className="pb-3 pr-4">Amount</th>
                                    <th className="pb-3 pr-4">Status</th>
                                    <th className="pb-3 pr-4">Comment</th>
                                    <th className="pb-3 pr-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayExpenses.map((e) => (
                                    <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                        <td className="py-3.5 pr-4 font-medium text-slate-800">{e.title}</td>
                                        <td className="py-3.5 pr-4 text-slate-600">{e.employeeName}</td>
                                        <td className="py-3.5 pr-4 text-slate-500">{e.category}</td>
                                        <td className="py-3.5 pr-4 font-semibold text-slate-700">₹{e.amount}</td>
                                        <td className="py-3.5 pr-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                e.status === "FINANCE_APPROVED" ? "bg-blue-100 text-blue-700" :
                                                e.status === "REIMBURSED" ? "bg-green-100 text-green-700" :
                                                "bg-red-100 text-red-700"
                                            }`}>{e.status?.replace(/_/g, " ")}</span>
                                        </td>
                                        <td className="py-3.5 pr-4 text-sm text-slate-400">{e.financeComment || "-"}</td>
                                        <td className="py-3.5 pr-4">
                                            {e.status === "FINANCE_APPROVED" && (
                                                <button onClick={() => handleReimburse(e.id)}
                                                    className="px-4 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition">
                                                    Pay Now
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {displayExpenses.length === 0 && <tr><td colSpan={7} className="text-center text-slate-400 py-8">No records found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reimbursements;
