import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, Plane, DollarSign, Clock,
  Receipt, History, ChevronRight,
} from "lucide-react";

const statusBadge = {
  DRAFT: "bg-gray-100 text-gray-700", SUBMITTED: "bg-blue-100 text-blue-700",
  POLICY_VALIDATION: "bg-orange-100 text-orange-700", MANAGER_REVIEW: "bg-amber-100 text-amber-700",
  MANAGER_APPROVED: "bg-teal-100 text-teal-700", FINANCE_REVIEW: "bg-purple-100 text-purple-700",
  FINANCE_APPROVED: "bg-green-100 text-green-700", ITINERARY_CREATED: "bg-indigo-100 text-indigo-700",
  TRAVEL_IN_PROGRESS: "bg-cyan-100 text-cyan-700", EXPENSE_SUBMITTED: "bg-pink-100 text-pink-700",
  EXPENSE_REVIEW: "bg-rose-100 text-rose-700", REIMBURSED: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-green-100 text-green-700", CANCELLED: "bg-slate-100 text-slate-700", REJECTED: "bg-red-100 text-red-700",
};

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiClient.get("/employee/requests"),
      apiClient.get("/employee/expenses"),
    ]).then(([r, e]) => {
      if (!mounted) return;
      setRequests(r.data || []);
      setExpenses(e.data || []);
    }).catch(() => {}).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" /></div>;
  }

  const totalExpenseAmt = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const pending = requests.filter((r) => ["SUBMITTED", "POLICY_VALIDATION", "MANAGER_REVIEW", "FINANCE_REVIEW"].includes(r.status));
  const upcoming = requests.filter((r) => ["MANAGER_APPROVED", "FINANCE_APPROVED", "ITINERARY_CREATED"].includes(r.status));
  const inProgress = requests.filter((r) => r.status === "TRAVEL_IN_PROGRESS");

  const cards = [
    { label: "Total Requests", value: requests.length, icon: ClipboardList, color: "bg-blue-500", path: "/employee/requests" },
    { label: "Pending", value: pending.length, icon: Clock, color: "bg-amber-500", path: "/employee/requests" },
    { label: "Upcoming Travel", value: upcoming.length + inProgress.length, icon: Plane, color: "bg-green-500", path: "/employee/itineraries" },
    { label: "Total Expenses", value: `₹${totalExpenseAmt.toLocaleString()}`, icon: DollarSign, color: "bg-purple-500", path: "/employee/expenses" },
  ];

  const last5 = (arr) => arr?.slice(-5).reverse() || [];

  const reimbursements = expenses.filter((e) => ["FINANCE_APPROVED", "REIMBURSED", "REJECTED"].includes(e.status));
  const history = requests.filter((r) => ["COMPLETED", "REIMBURSED", "TRAVEL_IN_PROGRESS", "CANCELLED", "REJECTED"].includes(r.status));

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-3xl text-slate-700" />
          <h1 className="text-3xl font-bold text-slate-800">Employee Dashboard</h1>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c) => (
            <div key={c.label} onClick={() => navigate(c.path)} className="bg-white rounded-2xl shadow-md border border-slate-200 p-5 flex items-center gap-4 cursor-pointer hover:shadow-lg hover:border-green-200 transition">
              <div className={`${c.color} p-3 rounded-xl text-white`}><c.icon size={24} /></div>
              <div>
                <p className="text-sm text-slate-500">{c.label}</p>
                <p className="text-2xl font-bold text-slate-800">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

         
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><ClipboardList size={17} /> Travel Requests</h2>
              <button onClick={() => navigate("/employee/requests")} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-medium">View All <ChevronRight size={13} /></button>
            </div>
            {last5(requests).length === 0 ? <p className="text-slate-400 text-center py-6 text-sm">No requests</p> : (
              <div className="space-y-2">
              {last5(requests).map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{r.destination || "—"}</p>
                      <p className="text-xs text-slate-400">₹{r.budget?.toLocaleString() || "0"}</p>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${statusBadge[r.status] || "bg-slate-100 text-slate-700"}`}>
                      {r.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><Receipt size={17} /> My Expenses</h2>
              <button onClick={() => navigate("/employee/expenses")} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-medium">View All <ChevronRight size={13} /></button>
            </div>
            {last5(expenses).length === 0 ? <p className="text-slate-400 text-center py-6 text-sm">No expenses</p> : (
              <div className="space-y-2">
                {last5(expenses).map((e) => (
                  <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{e.title || "Expense"}</p>
                      <p className="text-xs text-slate-400">₹{e.amount?.toLocaleString() || "0"} · {e.category || "—"}</p>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${statusBadge[e.status] || "bg-slate-100 text-slate-700"}`}>
                      {e.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

         
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><DollarSign size={17} /> Reimbursements</h2>
              <button onClick={() => navigate("/employee/reimbursements")} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-medium">View All <ChevronRight size={13} /></button>
            </div>
            {last5(reimbursements).length === 0 ? <p className="text-slate-400 text-center py-6 text-sm">No reimbursements</p> : (
              <div className="space-y-2">
                {last5(reimbursements).map((e) => (
                  <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{e.title || "Expense"}</p>
                      <p className="text-xs text-slate-400">₹{e.amount?.toLocaleString() || "0"}</p>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${e.status === "FINANCE_APPROVED" ? "bg-blue-100 text-blue-700" : e.status === "REIMBURSED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {e.status === "FINANCE_APPROVED" ? "Approved" : e.status === "REIMBURSED" ? "Paid" : "Rejected"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><History size={17} /> Travel History</h2>
              <button onClick={() => navigate("/employee/history")} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-medium">View All <ChevronRight size={13} /></button>
            </div>
            {last5(history).length === 0 ? <p className="text-slate-400 text-center py-6 text-sm">No history</p> : (
              <div className="space-y-2">
                {last5(history).map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{r.destination || "—"}</p>
                      <p className="text-xs text-slate-400">₹{r.budget?.toLocaleString() || "0"} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</p>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${["COMPLETED", "REIMBURSED"].includes(r.status) ? "bg-green-100 text-green-700" : r.status === "CANCELLED" ? "bg-slate-100 text-slate-700" : "bg-red-100 text-red-700"}`}>
                      {r.status === "TRAVEL_IN_PROGRESS" ? "In Progress" : r.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;