import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
const BASE_URL = "http://localhost:8080";
import { Receipt, Search, ExternalLink, Filter, ChevronDown } from "lucide-react";

const ExpenseManagement = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        apiClient.get("/finance/pending-reimbursements")
            .then((res) => setExpenses(res.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filtered = expenses.filter((e) => {
        const matchSearch =
            (e.title || "").toLowerCase().includes(search.toLowerCase()) ||
            (e.employeeName || "").toLowerCase().includes(search.toLowerCase());
        const matchStatus = !statusFilter || e.status === statusFilter;
        return matchSearch && matchStatus;
    }).sort((a, b) => (b.id || 0) - (a.id || 0));

    if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" /></div>;

    return (
        <div className="min-h-screen bg-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Receipt className="text-3xl text-slate-700" />
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">Expense Management</h1>
                                <p className="text-sm text-slate-400">Verify submitted expenses, review receipts, validate categories and amounts</p>
                            </div>
                        </div>
                        <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2.5 rounded-2xl border text-sm font-medium flex items-center gap-2 transition ${showFilters ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
                            <Filter size={16} /> Filters <ChevronDown size={14} />
                        </button>
                    </div>

                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Search by title or employee..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full border border-slate-300 rounded-2xl pl-11 pr-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                    </div>

                    {showFilters && (
                        <div className="mb-5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                            <label className="block text-sm font-medium text-slate-600 mb-1">Filter by Status</label>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 w-full max-w-xs">
                                <option value="">All Status</option>
                                {["SUBMITTED", "FINANCE_REVIEW", "FINANCE_APPROVED", "REJECTED", "REIMBURSED"].map((s) => (
                                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="pb-3 pr-4">Title</th>
                                    <th className="pb-3 pr-4">Employee</th>
                                    <th className="pb-3 pr-4">Category</th>
                                    <th className="pb-3 pr-4">Amount</th>
                                    <th className="pb-3 pr-4">Description</th>
                                    <th className="pb-3 pr-4">Status</th>
                                    <th className="pb-3 pr-4">Receipt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((e) => (
                                    <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                        <td className="py-3.5 pr-4 font-medium text-slate-800">{e.title}</td>
                                        <td className="py-3.5 pr-4 text-slate-600">{e.employeeName}</td>
                                        <td className="py-3.5 pr-4 text-slate-500">{e.category}</td>
                                        <td className="py-3.5 pr-4 font-semibold text-slate-700">₹{e.amount}</td>
                                        <td className="py-3.5 pr-4 max-w-xs truncate text-sm text-slate-500">{e.description || "-"}</td>
                                        <td className="py-3.5 pr-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                e.status === "SUBMITTED" ? "bg-blue-100 text-blue-700" :
                                                e.status === "FINANCE_APPROVED" ? "bg-green-100 text-green-700" :
                                                e.status === "REJECTED" ? "bg-red-100 text-red-700" :
                                                e.status === "REIMBURSED" ? "bg-purple-100 text-purple-700" :
                                                "bg-amber-100 text-amber-700"
                                            }`}>{e.status?.replace(/_/g, " ")}</span>
                                        </td>
                                        <td className="py-3.5 pr-4">
                                            {e.receiptUrl ? (
                                                <a href={`${BASE_URL}${e.receiptUrl}`} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 flex items-center gap-1 text-sm">
                                                    <ExternalLink size={14} /> View
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 text-sm">No receipt</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && <tr><td colSpan={7} className="text-center text-slate-400 py-8">No expenses found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseManagement;
