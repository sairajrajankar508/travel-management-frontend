import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Wallet, Clock, CheckCircle, XCircle, DollarSign,
  ChevronRight, Receipt, Plane, ClipboardCheck, Banknote,
} from "lucide-react";

const STATUS_BADGE = {
  SUBMITTED: "bg-blue-100 text-blue-700",
  FINANCE_REVIEW: "bg-purple-100 text-purple-700",
  FINANCE_APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  REIMBURSED: "bg-emerald-100 text-emerald-700",
  MANAGER_APPROVED: "bg-teal-100 text-teal-700",
  MANAGER_REVIEW: "bg-amber-100 text-amber-700",
};

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [travelRequests, setTravelRequests] = useState([]);
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get("/finance/dashboard"),
      apiClient.get("/finance/travel-requests"),
      apiClient.get("/finance/pending-approvals"),
      apiClient.get("/finance/recent-expenses"),
      apiClient.get("/finance/payment-history"),
    ]).then(([dash, travel, pend, recent, pay]) => {
      setStats(dash.data);
      setTravelRequests(travel.data || []);
      setPendingExpenses(pend.data || []);
      setRecentExpenses(recent.data || []);
      setPaymentHistory(pay.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
      </div>
    );
  }

  const last5 = (arr) => arr?.slice(-5).reverse() || [];

  const cards = [
    { label: "Total Expenses", value: stats?.totalExpenses || 0, icon: Wallet, color: "bg-blue-500", path: "/finance/expenses" },
    { label: "Pending", value: stats?.pending || 0, icon: Clock, color: "bg-amber-500", path: "/finance/pending-approvals" },
    { label: "Approved", value: stats?.approved || 0, icon: CheckCircle, color: "bg-green-500", path: "/finance/reimbursements" },
    { label: "Reimbursed", value: stats?.reimbursed || 0, icon: DollarSign, color: "bg-purple-500", path: "/finance/reimbursements" },
    { label: "Rejected", value: stats?.rejected || 0, icon: XCircle, color: "bg-red-500", path: "/finance/expenses" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-3xl text-slate-700" />
          <h1 className="text-3xl font-bold text-slate-800">Finance Dashboard</h1>
        </div>

        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cards.map((c) => (
            <div key={c.label} onClick={() => navigate(c.path)} className="bg-white rounded-2xl shadow-md border border-slate-200 p-4 flex items-center gap-3 cursor-pointer hover:shadow-lg hover:border-amber-200 transition">
              <div className={`${c.color} p-2.5 rounded-xl text-white`}><c.icon size={20} /></div>
              <div>
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className="text-xl font-bold text-slate-800">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Plane size={20} /> Pending Travel Approvals</h2>
            <button onClick={() => navigate("/finance/travel-requests")} className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-0.5 font-medium">View All <ChevronRight size={13} /></button>
          </div>
          {last5(travelRequests).length === 0 ? (
            <p className="text-slate-400 text-center py-8 text-sm">No pending travel requests</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="pb-3 pr-4">Employee</th>
                    <th className="pb-3 pr-4">Destination</th>
                    <th className="pb-3 pr-4">Purpose</th>
                    <th className="pb-3 pr-4">Budget</th>
                    <th className="pb-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {last5(travelRequests).map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-3 pr-4 font-medium text-slate-800">{r.employeeName || r.user?.name || "—"}</td>
                      <td className="py-3 pr-4 text-slate-600">{r.destination || "—"}</td>
                      <td className="py-3 pr-4 text-sm text-slate-500">{r.purpose || "—"}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-700">₹{r.budget?.toLocaleString() || "0"}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[r.status] || "bg-slate-100 text-slate-700"}`}>{r.status?.replace(/_/g, " ")}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><ClipboardCheck size={20} /> Pending Expenses</h2>
            <button onClick={() => navigate("/finance/pending-approvals")} className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-0.5 font-medium">View All <ChevronRight size={13} /></button>
          </div>
          {last5(pendingExpenses).length === 0 ? (
            <p className="text-slate-400 text-center py-8 text-sm">No pending expenses</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="pb-3 pr-4">Title</th>
                    <th className="pb-3 pr-4">Employee</th>
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 pr-4">Amount</th>
                    <th className="pb-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {last5(pendingExpenses).map((e) => (
                    <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-3 pr-4 font-medium text-slate-800">{e.title || "—"}</td>
                      <td className="py-3 pr-4 text-slate-600">{e.employeeName || "—"}</td>
                      <td className="py-3 pr-4 text-sm text-slate-500">{e.category || "—"}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-700">₹{e.amount?.toLocaleString() || "0"}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[e.status] || "bg-amber-100 text-amber-700"}`}>{e.status?.replace(/_/g, " ")}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

       
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Receipt size={20} /> Recent Expenses</h2>
            <button onClick={() => navigate("/finance/expenses")} className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-0.5 font-medium">View All <ChevronRight size={13} /></button>
          </div>
          {last5(recentExpenses).length === 0 ? (
            <p className="text-slate-400 text-center py-8 text-sm">No expenses yet</p>
          ) : (
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
                  {last5(recentExpenses).map((e) => (
                    <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-3 pr-4 font-medium text-slate-800">{e.title || "—"}</td>
                      <td className="py-3 pr-4 text-slate-600">{e.employeeName || "—"}</td>
                      <td className="py-3 pr-4 text-sm text-slate-500">{e.category || "—"}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-700">₹{e.amount?.toLocaleString() || "0"}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[e.status] || "bg-slate-100 text-slate-700"}`}>{e.status?.replace(/_/g, " ")}</span>
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-400">{e.actionDate ? new Date(e.actionDate).toLocaleDateString() : e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

       
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Banknote size={20} /> Reimbursements</h2>
            <button onClick={() => navigate("/finance/reimbursements")} className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-0.5 font-medium">View All <ChevronRight size={13} /></button>
          </div>
          {last5(paymentHistory).length === 0 ? (
            <p className="text-slate-400 text-center py-8 text-sm">No reimbursements yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="pb-3 pr-4">Title</th>
                    <th className="pb-3 pr-4">Employee</th>
                    <th className="pb-3 pr-4">Amount</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {last5(paymentHistory).map((e) => (
                    <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-3 pr-4 font-medium text-slate-800">{e.title || "—"}</td>
                      <td className="py-3 pr-4 text-slate-600">{e.employeeName || "—"}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-700">₹{e.amount?.toLocaleString() || "0"}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          e.status === "FINANCE_APPROVED" ? "bg-green-100 text-green-700" :
                          e.status === "REIMBURSED" ? "bg-emerald-100 text-emerald-700" :
                          e.status === "REJECTED" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>{e.status?.replace(/_/g, " ")}</span>
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-400">{e.actionDate ? new Date(e.actionDate).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FinanceDashboard;