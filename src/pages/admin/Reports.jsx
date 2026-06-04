import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { FileBarChart2, DollarSign, Plane, TrendingUp } from "lucide-react";

const Reports = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reqRes = await apiClient.get("/admin/requests");
        setRequests(reqRes.data || []);
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  const totalBudget = requests.reduce((sum, r) => sum + (r.budget || 0), 0);
  const completedRequests = requests.filter((r) => r.status === "COMPLETED" || r.status === "REIMBURSED");
  const pendingRequests = requests.filter((r) => !["COMPLETED", "REJECTED", "CANCELLED", "DRAFT"].includes(r.status));
  const destCount = {};
  requests.forEach((r) => {
    if (r.destination) destCount[r.destination] = (destCount[r.destination] || 0) + 1;
  });
  const topDestinations = Object.entries(destCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <FileBarChart2 className="text-3xl text-slate-700" />
          <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        </div>

      
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-w-0 *:min-w-0">
          {[
            { label: "Total Requests", value: requests.length, icon: Plane, color: "bg-blue-100 text-blue-600" },
            { label: "Completed", value: completedRequests.length, icon: TrendingUp, color: "bg-green-100 text-green-600" },
            { label: "Pending", value: pendingRequests.length, icon: TrendingUp, color: "bg-amber-100 text-amber-600" },
            { label: "Total Budget", value: `₹${totalBudget.toLocaleString()}`, icon: DollarSign, color: "bg-purple-100 text-purple-600" },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-3 min-w-0">
              <div className={`p-2.5 rounded-xl ${c.color} shrink-0`}><c.icon size={20} /></div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 truncate">{c.label}</p>
                <p className="text-xl font-bold text-slate-800 truncate">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

      
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Plane size={18} /> Top Destinations</h2>
            <div className="space-y-3">
              {topDestinations.map(([dest, count]) => (
                <div key={dest} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <p className="font-medium text-slate-700">{dest}</p>
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">{count} trips</span>
                </div>
              ))}
              {topDestinations.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No data</p>}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><DollarSign size={18} /> Cost Overview</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <div>
                  <p className="text-sm text-slate-500">Average Budget per Request</p>
                  <p className="text-lg font-bold text-slate-800">₹{(requests.length > 0 ? totalBudget / requests.length : 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-2xl">
                <div>
                  <p className="text-sm text-slate-500">Highest Budget</p>
                  <p className="text-lg font-bold text-green-700">₹{Math.max(...requests.map((r) => r.budget || 0)).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-amber-50 rounded-2xl">
                <div>
                  <p className="text-sm text-slate-500">Unique Travelers</p>
                  <p className="text-lg font-bold text-amber-700">{new Set(requests.map((r) => r.user?.id)).size}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
