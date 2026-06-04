import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, Clock, CheckCircle, DollarSign,
  ChevronRight, History, Users
} from "lucide-react";

const STATUS_BADGE = {
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  POLICY_VALIDATION: "bg-orange-100 text-orange-700",
  MANAGER_REVIEW: "bg-amber-100 text-amber-700",
  MANAGER_APPROVED: "bg-teal-100 text-teal-700",
  FINANCE_REVIEW: "bg-purple-100 text-purple-700",
  FINANCE_APPROVED: "bg-green-100 text-green-700",
  ITINERARY_CREATED: "bg-indigo-100 text-indigo-700",
  TRAVEL_IN_PROGRESS: "bg-cyan-100 text-cyan-700",
  EXPENSE_SUBMITTED: "bg-pink-100 text-pink-700",
  EXPENSE_REVIEW: "bg-rose-100 text-rose-700",
  REIMBURSED: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-slate-100 text-slate-700",
  REJECTED: "bg-red-100 text-red-700",
};

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [teamRequests, setTeamRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get("/manager/dashboard"),
      apiClient.get("/manager/requests"),
      apiClient.get("/manager/team-activity"),
      apiClient.get("/manager/history"),
    ]).then(([dash, req, team, hist]) => {
      setStats(dash.data);
      setPending(req.data || []);
      setTeamRequests(team.data || []);
      setHistory(hist.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
      </div>
    );
  }

  const last5 = (arr) => arr?.slice(-5).reverse() || [];

  const cards = [
    { label: "Total Requests", value: stats?.totalRequests || 0, icon: ClipboardList, color: "bg-purple-500", path: "/manager/team-requests" },
    { label: "Pending Approval", value: stats?.pendingRequests || 0, icon: Clock, color: "bg-amber-500", path: "/manager/pending-approvals" },
    { label: "Approved", value: stats?.approvedRequests || 0, icon: CheckCircle, color: "bg-green-500", path: "/manager/team-history" },
    { label: "Total Budget", value: `₹${(stats?.totalBudget || 0).toLocaleString()}`, icon: DollarSign, color: "bg-blue-500", path: "/manager/reports" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-3xl text-slate-700" />
          <h1 className="text-3xl font-bold text-slate-800">Manager Dashboard</h1>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c) => (
            <div key={c.label} onClick={() => navigate(c.path)} className="bg-white rounded-2xl shadow-md border border-slate-200 p-5 flex items-center gap-4 cursor-pointer hover:shadow-lg hover:border-purple-200 transition">
              <div className={`${c.color} p-3 rounded-xl text-white`}><c.icon size={24} /></div>
              <div>
                <p className="text-sm text-slate-500">{c.label}</p>
                <p className="text-2xl font-bold text-slate-800">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* PENDING APPROVALS */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Clock size={20} /> Pending Approvals</h2>
            <button onClick={() => navigate("/manager/pending-approvals")} className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-0.5 font-medium">View All <ChevronRight size={13} /></button>
          </div>
          {last5(pending).length === 0 ? (
            <p className="text-slate-400 text-center py-8 text-sm">No pending requests</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="pb-3 pr-4">Employee</th>
                    <th className="pb-3 pr-4">Destination</th>
                    <th className="pb-3 pr-4">Budget</th>
                    <th className="pb-3 pr-4">Purpose</th>
                    <th className="pb-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {last5(pending).map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-3 pr-4 font-medium text-slate-800">{r.employeeName || r.user?.name || "—"}</td>
                      <td className="py-3 pr-4 text-slate-600">{r.destination || "—"}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-700">₹{r.budget?.toLocaleString() || "0"}</td>
                      <td className="py-3 pr-4 text-sm text-slate-500">{r.purpose || "—"}</td>
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

        {/* TEAM REQUESTS - Last 5 */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Users size={20} /> Team Requests</h2>
            <button onClick={() => navigate("/manager/team-requests")} className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-0.5 font-medium">View All <ChevronRight size={13} /></button>
          </div>
          {last5(teamRequests).length === 0 ? (
            <p className="text-slate-400 text-center py-8 text-sm">No team requests</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="pb-3 pr-4">Employee</th>
                    <th className="pb-3 pr-4">Destination</th>
                    <th className="pb-3 pr-4">Budget</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {last5(teamRequests).map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-3 pr-4 font-medium text-slate-800">{r.employeeName || r.user?.name || "—"}</td>
                      <td className="py-3 pr-4 text-slate-600">{r.destination || "—"}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-700">₹{r.budget?.toLocaleString() || "0"}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[r.status] || "bg-slate-100 text-slate-700"}`}>{r.status?.replace(/_/g, " ")}</span>
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-400">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* TRAVEL HISTORY - Last 5 */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><History size={20} /> Travel History</h2>
            <button onClick={() => navigate("/manager/team-history")} className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-0.5 font-medium">View All <ChevronRight size={13} /></button>
          </div>
          {last5(history).length === 0 ? (
            <p className="text-slate-400 text-center py-8 text-sm">No history yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="pb-3 pr-4">Employee</th>
                    <th className="pb-3 pr-4">Destination</th>
                    <th className="pb-3 pr-4">Budget</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {last5(history).map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-3 pr-4 font-medium text-slate-800">{r.employeeName || r.user?.name || "—"}</td>
                      <td className="py-3 pr-4 text-slate-600">{r.destination || "—"}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-700">₹{r.budget?.toLocaleString() || "0"}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[r.status] || "bg-slate-100 text-slate-700"}`}>{r.status?.replace(/_/g, " ")}</span>
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-400">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</td>
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

export default ManagerDashboard;