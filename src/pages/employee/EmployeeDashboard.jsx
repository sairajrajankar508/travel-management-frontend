import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, Plane, DollarSign, Clock,
  Receipt, History, MapPinned, ChevronRight, CheckCircle, XCircle,
  Send, ShieldCheck, UserCheck, CreditCard, Flag, AlertTriangle,
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

const ALL_STEPS = [
  { key: "SUBMITTED", label: "Submitted", icon: Send },
  { key: "MANAGER_REVIEW", label: "Manager", icon: UserCheck },
  { key: "FINANCE_REVIEW", label: "Finance", icon: CreditCard },
  { key: "FINANCE_APPROVED", label: "Approved", icon: CheckCircle },
  { key: "ITINERARY_CREATED", label: "Itinerary", icon: MapPinned },
  { key: "TRAVEL_STARTED", label: "Travel", icon: Plane },
  { key: "EXPENSE_SUBMITTED", label: "Expense", icon: Receipt },
  { key: "EXPENSE_REVIEW", label: "Review", icon: ShieldCheck },
  { key: "REIMBURSED", label: "Paid", icon: DollarSign },
];

const STATUS_MAP = {
  DRAFT: -1, SUBMITTED: 0, POLICY_VALIDATION: 0.5, MANAGER_REVIEW: 1,
  FINANCE_REVIEW: 2, MANAGER_APPROVED: 2.5, FINANCE_APPROVED: 3,
  ITINERARY_CREATED: 4, TRAVEL_IN_PROGRESS: 5,
  EXPENSE_SUBMITTED: 6, EXPENSE_REVIEW: 7, REIMBURSED: 8, COMPLETED: 8,
  CANCELLED: -2, REJECTED: -2,
};

const CANCEL_STATUSES = ["CANCELLED", "REJECTED"];

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

  const renderHorizontalStepper = (r) => {
    const pos = STATUS_MAP[r.status] ?? -1;
    const isCancelled = CANCEL_STATUSES.includes(r.status);
    const hasViolation = r.policyViolated || r.status === "POLICY_VALIDATION";

    if (isCancelled) {
      return (
        <div className="flex items-center gap-2 text-sm text-red-500 py-1">
          <XCircle size={15} /> Request {r.status === "CANCELLED" ? "cancelled" : "rejected"}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto pb-1">
        <div className="flex items-center gap-0 min-w-max">
          {ALL_STEPS.map((step, i) => {
            const StepIcon = step.icon;
            const stepPos = STATUS_MAP[step.key];
            const done = pos > stepPos;
            const current = pos === stepPos ||
              (step.key === "MANAGER_REVIEW" && pos === 0.5) ||
              (step.key === "FINANCE_REVIEW" && pos === 2.5);

            return (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    done ? "bg-green-500" : current ? "bg-blue-600 ring-2 ring-blue-200" : "bg-slate-200"
                  }`}>
                    {done ? <CheckCircle size={16} className="text-white" /> :
                     <StepIcon size={14} className={current ? "text-white" : "text-slate-400"} />}
                  </div>
                  <span className={`text-[10px] mt-1.5 whitespace-nowrap font-medium ${
                    done ? "text-green-600" : current ? "text-blue-700" : "text-slate-400"
                  }`}>{step.label}</span>
                </div>
                {i < ALL_STEPS.length - 1 && (
                  <div className={`w-10 md:w-16 h-0.5 mx-1 mb-5 rounded-full ${
                    pos > stepPos + 0.5 ? "bg-green-400" : pos >= stepPos ? "bg-blue-400" : "bg-slate-200"
                  }`} />
                )}
              </div>
            );
          })}

          {hasViolation && (
            <div className="ml-3 flex items-center gap-1.5 text-[11px] text-orange-700 bg-orange-50 px-2.5 py-1.5 rounded-lg border border-orange-200 whitespace-nowrap">
              <AlertTriangle size={12} />
              <span>{r.policyViolationReason ? "Policy: " + r.policyViolationReason : "Policy check"}</span>
              {pos === 0.5 && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />}
            </div>
          )}

          {(pos === 8 || r.status === "COMPLETED") && (
            <div className="ml-3 flex items-center gap-1.5 text-[11px] text-green-700 bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-200 whitespace-nowrap">
              <Flag size={12} />
              <span>Completed</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-3xl text-slate-700" />
          <h1 className="text-3xl font-bold text-slate-800">Employee Dashboard</h1>
        </div>

        {/* STATS CARDS */}
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

        {/* CURRENT REQUEST STATUS — full-width horizontal pipeline */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><MapPinned size={20} /> Current Request Status</h2>
          {requests.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No requests yet</p>
          ) : (
            <div className="space-y-4">
              {requests.slice(-1).map((r) => (
                <div key={r.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        CANCEL_STATUSES.includes(r.status) ? "bg-red-500" :
                        r.status === "COMPLETED" || r.status === "REIMBURSED" ? "bg-green-500" :
                        "bg-blue-500"
                      }`} />
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{r.destination || "Travel Request"}</p>
                        <p className="text-xs text-slate-400">₹{r.budget?.toLocaleString() || "0"} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 ${statusBadge[r.status] || "bg-slate-100 text-slate-700"}`}>
                      {r.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                  {renderHorizontalStepper(r)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION PREVIEWS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* TRAVEL REQUESTS */}
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

          {/* EXPENSES */}
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

          {/* REIMBURSEMENTS */}
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

          {/* TRAVEL HISTORY */}
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