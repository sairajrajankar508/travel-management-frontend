import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
const BASE_URL = "http://localhost:8080";
import toast from "react-hot-toast";
import { Receipt, Plus, X, Upload, Trash2, FileText } from "lucide-react";

const STATUS_BADGE = {
  SUBMITTED: "bg-blue-100 text-blue-700",
  MANAGER_REVIEW: "bg-amber-100 text-amber-700",
  FINANCE_REVIEW: "bg-purple-100 text-purple-700",
  FINANCE_APPROVED: "bg-green-100 text-green-700",
  REIMBURSED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [travelRequests, setTravelRequests] = useState([]);
  const [form, setForm] = useState({ title: "", amount: "", category: "Travel", description: "", expenseDate: "", travelRequestId: "" });
  const [file, setFile] = useState(null);

  const fetchExpenses = () => {
    apiClient.get("/employee/expenses").then((res) => {
      setExpenses(res.data || []);
    }).catch(() => {
      toast.error("Failed to load expenses");
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => { fetchExpenses(); }, []);

  useEffect(() => {
    apiClient.get("/employee/requests").then((res) => {
      setTravelRequests(res.data || []);
    }).catch(() => {});
  }, []);

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) return toast.error("Title and amount required");
    if (!form.travelRequestId) return toast.error("Select a travel request");
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("amount", form.amount);
    fd.append("category", form.category);
    fd.append("description", form.description);
    fd.append("expenseDate", form.expenseDate || new Date().toISOString().split("T")[0]);
    fd.append("travelRequestId", form.travelRequestId);
    if (file) fd.append("file", file);
    const promise = apiClient.post("/employee/expense/add", fd, { headers: { "Content-Type": "multipart/form-data" } })
      .then(() => { setShowForm(false); setForm({ title: "", amount: "", category: "Travel", description: "", expenseDate: "", travelRequestId: "" }); setFile(null); fetchExpenses(); });
    toast.promise(promise, {
      loading: "Adding expense...",
      success: "Expense added",
      error: (err) => err?.response?.data?.message || "Failed to add expense",
    });
  };

  const deleteExpense = (id) => {
    if (!confirm("Delete this expense?")) return;
    const promise = apiClient.delete(`/employee/expense/${id}`).then(() => fetchExpenses());
    toast.promise(promise, {
      loading: "Deleting expense...",
      success: "Deleted",
      error: "Failed to delete",
    });
  };

  const totalAmount = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Receipt className="text-3xl text-slate-700" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Expenses</h1>
                <p className="text-sm text-slate-400">{expenses.length} items · ₹{totalAmount.toLocaleString()} total</p>
              </div>
            </div>
            <button onClick={() => setShowForm(true)} className="px-5 py-2.5 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-medium text-sm flex items-center gap-2 transition">
              <Plus size={17} /> Add Expense
            </button>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="pb-3 pr-4">Title</th>
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...expenses].sort((a, b) => (b.id || 0) - (a.id || 0)).map((e) => (
                  <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="py-3.5 pr-4 font-medium text-slate-800">{e.title}</td>
                    <td className="py-3.5 pr-4 text-slate-500 text-sm">{e.category || "—"}</td>
                    <td className="py-3.5 pr-4 font-semibold text-slate-700">₹{e.amount?.toLocaleString() || "0"}</td>
                    <td className="py-3.5 pr-4 text-sm text-slate-400">{e.expenseDate ? new Date(e.expenseDate).toLocaleDateString() : "—"}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[e.status] || "bg-slate-100 text-slate-700"}`}>
                        {e.status?.replace(/_/g, " ") || "DRAFT"}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {e.receiptUrl && (
                          <a href={`${BASE_URL}${e.receiptUrl}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition" title="View receipt">
                            <FileText size={15} />
                          </a>
                        )}
                        {e.status === "SUBMITTED" && (
                          <button onClick={() => deleteExpense(e.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && <tr><td colSpan="6" className="text-center text-slate-400 py-8">No expenses yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD EXPENSE MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-800">Add Expense</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                  <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                    <option>Travel</option><option>Food</option><option>Accommodation</option><option>Transport</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Travel Request</label>
                <select value={form.travelRequestId} onChange={(e) => setForm({ ...form, travelRequestId: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" required>
                  <option value="">Select a request...</option>
                  {travelRequests.filter(r => r.status === "TRAVEL_IN_PROGRESS").map(r => (
                    <option key={r.id} value={r.id}>#{r.id} — {r.fromLocation} → {r.toLocation}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Receipt (optional)</label>
                <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-green-400 transition text-sm text-slate-500">
                  <Upload size={18} />
                  {file ? <span className="truncate block max-w-50">{file.name}</span> : "Upload receipt"}
                  <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                </label>
              </div>
              <button type="submit" className="w-full py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition">
                Add Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
