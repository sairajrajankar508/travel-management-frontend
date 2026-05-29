import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { GitBranch, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";

const stuckStatuses = ["POLICY_VALIDATION", "MANAGER_REVIEW", "FINANCE_REVIEW", "EXPENSE_REVIEW"];

const statusColor = {
  POLICY_VALIDATION: "bg-orange-100 text-orange-700", MANAGER_REVIEW: "bg-amber-100 text-amber-700",
  FINANCE_REVIEW: "bg-purple-100 text-purple-700",
  EXPENSE_REVIEW: "bg-rose-100 text-rose-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  MANAGER_APPROVED: "bg-teal-100 text-teal-700",
  FINANCE_APPROVED: "bg-green-100 text-green-700",
};

const ApprovalMonitoring = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");

  useEffect(() => {
    let mounted = true;
    apiClient.get("/admin/requests").then((res) => {
      if (!mounted) return;
      setRequests(res.data || []);
    }).catch(() => {
      if (mounted) toast.error("Failed to load requests");
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const pending = requests.filter((r) =>
    ["SUBMITTED", "POLICY_VALIDATION", "MANAGER_REVIEW", "MANAGER_APPROVED", "FINANCE_REVIEW", "FINANCE_APPROVED", "EXPENSE_REVIEW", "EXPENSE_SUBMITTED"].includes(r.status)
  );

  const stuck = requests.filter((r) => stuckStatuses.includes(r.status));

  const completed = requests.filter((r) =>
    ["COMPLETED", "REIMBURSED", "TRAVEL_IN_PROGRESS"].includes(r.status)
  );

  const rejected = requests.filter((r) =>
    ["REJECTED", "CANCELLED"].includes(r.status)
  );

  const displayRequests = tab === "pending" ? pending : tab === "stuck" ? stuck : tab === "completed" ? completed : rejected;

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  const tabs = [
    { key: "pending", label: "Pending", count: pending.length, icon: Clock },
    { key: "stuck", label: "Stuck", count: stuck.length, icon: AlertTriangle },
    { key: "completed", label: "Completed", count: completed.length, icon: CheckCircle },
    { key: "rejected", label: "Rejected", count: rejected.length, icon: XCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          {/* HEADER */}
          <div className="flex items-center gap-3 mb-6">
            <GitBranch className="text-3xl text-slate-700" />
            <h1 className="text-2xl font-bold text-slate-800">Approval Monitoring</h1>
          </div>

          {/* TABS */}
          <div className="flex gap-3 mb-6">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-5 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2 transition ${
                  tab === t.key
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>
                <t.icon size={16} />
                {t.label}
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${tab === t.key ? "bg-blue-500" : "bg-slate-300"}`}>{t.count}</span>
              </button>
            ))}
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="pb-3 pr-4">Employee</th>
                  <th className="pb-3 pr-4">Destination</th>
                  <th className="pb-3 pr-4">Budget</th>
                  <th className="pb-3 pr-4">Current Stage</th>
                  <th className="pb-3 pr-4">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {displayRequests.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="py-3.5 pr-4 font-medium text-slate-800">{r.user?.name || "N/A"}</td>
                    <td className="py-3.5 pr-4 text-slate-600">{r.destination || "—"}</td>
                    <td className="py-3.5 pr-4 font-semibold text-slate-700">₹{r.budget?.toLocaleString() || "0"}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[r.status] || "bg-slate-100 text-slate-700"}`}>
                        {r.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-sm text-slate-400">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
                {displayRequests.length === 0 && <tr><td colSpan="5" className="text-center text-slate-400 py-12">No requests in this stage</td></tr>}
              </tbody>
            </table>
          </div>

          {/* APPROVAL FLOW DIAGRAM */}
          <div className="mt-8 p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <RefreshCw size={16} /> Approval Flow
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {["DRAFT", "SUBMITTED", "MANAGER REVIEW", "FINANCE REVIEW", "ITINERARY", "TRAVEL", "EXPENSE", "REIMBURSED", "COMPLETED"].map((step, i) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium whitespace-nowrap">{step}</span>
                  {i < 8 && <span className="text-slate-300 text-lg">→</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalMonitoring;
