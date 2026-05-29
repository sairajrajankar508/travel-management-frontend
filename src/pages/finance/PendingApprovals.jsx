import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { Clock, CheckCircle, XCircle, Search, MessageSquare } from "lucide-react";

const PendingApprovals = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [comments, setComments] = useState({});

    const fetchData = () => {
        apiClient.get("/finance/pending-approvals").then((res) => {
            setExpenses(res.data || []);
        }).catch((err) => {
            console.error(err);
        }).finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => { fetchData(); }, []);

    const handleAction = (id, action) => {
        const label = action === "approve" ? "Approved" : "Rejected";
        const promise = (action === "approve" ? apiClient.put(`/finance/approve/${id}`) : apiClient.put(`/finance/reject/${id}`)).then(() => fetchData());
        toast.promise(promise, {
            loading: `${action === "approve" ? "Approving" : "Rejecting"} expense...`,
            success: `Expense ${label}`,
            error: "Failed to process expense",
        });
    };

    const filtered = expenses.filter(
        (e) =>
            (e.title || "").toLowerCase().includes(search.toLowerCase()) ||
            (e.employeeName || "").toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" /></div>;

    return (
        <div className="min-h-screen bg-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="text-3xl text-slate-700" />
                        <h1 className="text-2xl font-bold text-slate-800">Pending Expenses</h1>
                        <span className="ml-auto bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold">{expenses.length} pending</span>
                    </div>
                    <p className="text-slate-500 mb-6">Approve or reject expenses pending finance review</p>

                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Search by title or employee..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full border border-slate-300 rounded-2xl pl-11 pr-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                    </div>

                    <div className="space-y-4">
                        {filtered.map((exp) => (
                            <div key={exp.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-800 mb-2">{exp.title}</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm min-w-0 *:min-w-0 *:wrap-break-word">
                                            <div><span className="text-slate-500">Employee:</span> <span className="font-medium text-slate-700">{exp.employeeName}</span></div>
                                            <div><span className="text-slate-500">Category:</span> <span className="font-medium text-slate-700">{exp.category}</span></div>
                                            <div><span className="text-slate-500">Amount:</span> <span className="font-medium text-slate-700">₹{exp.amount}</span></div>
                                            <div><span className="text-slate-500">Status:</span> <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{exp.status?.replace(/_/g, " ")}</span></div>
                                        </div>
                                        {exp.description && <p className="text-sm text-slate-400 mt-2">{exp.description}</p>}
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <MessageSquare size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="text" placeholder="Add comment (optional)..." value={comments[exp.id] || ""}
                                            onChange={(e) => setComments({ ...comments, [exp.id]: e.target.value })}
                                            className="w-full border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                                    </div>
                                    <button onClick={() => handleAction(exp.id, "approve")} className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium flex items-center gap-1.5 transition">
                                        <CheckCircle size={16} /> Approve
                                    </button>
                                    <button onClick={() => handleAction(exp.id, "reject")} className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium flex items-center gap-1.5 transition">
                                        <XCircle size={16} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filtered.length === 0 && <p className="text-slate-400 text-center py-12">No pending approvals</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PendingApprovals;
