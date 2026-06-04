import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { FileBarChart2, DollarSign, Plane, TrendingUp, Users } from "lucide-react";

const ManagerReports = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    apiClient.get("/manager/team-activity").then((res) => {
      setRequests(res.data || []);
    }).catch(() => {
      toast.error("Failed to load");
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" /></div>;

  const totalBudget = requests.reduce((s, r) => s + (r.budget || 0), 0);
  const completed = requests.filter((r) => ["COMPLETED", "REIMBURSED"].includes(r.status)).length;
  const pending = requests.filter((r) => ["SUBMITTED", "POLICY_VALIDATION", "MANAGER_REVIEW", "FINANCE_REVIEW"].includes(r.status)).length;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <FileBarChart2 className="text-3xl text-slate-700" />
          <h1 className="text-2xl font-bold text-slate-800">Team Reports</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Requests", value: requests.length, icon: Plane, color: "bg-blue-100 text-blue-600" },
            { label: "Completed", value: completed, icon: TrendingUp, color: "bg-green-100 text-green-600" },
            { label: "Pending", value: pending, icon: Users, color: "bg-amber-100 text-amber-600" },
            { label: "Total Budget", value: `₹${totalBudget.toLocaleString()}`, icon: DollarSign, color: "bg-purple-100 text-purple-600" },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${c.color}`}><c.icon size={20} /></div>
              <div>
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className="text-xl font-bold text-slate-800">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ManagerReports;
