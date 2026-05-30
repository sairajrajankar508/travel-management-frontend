import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { ClipboardList, Search, Filter, ChevronDown } from "lucide-react";

const actionColor = {
  USER_CREATED: "bg-green-100 text-green-700",
  USER_UPDATED: "bg-blue-100 text-blue-700",
  USER_DELETED: "bg-red-100 text-red-700",
  USER_STATUS_UPDATED: "bg-amber-100 text-amber-700",
  POLICY_CREATED: "bg-green-100 text-green-700",
  POLICY_STATUS_UPDATED: "bg-amber-100 text-amber-700",
  POLICY_DELETED: "bg-red-100 text-red-700",
  VIOLATION_WAIVED: "bg-purple-100 text-purple-700",
  REQUEST_DISMISSED: "bg-gray-100 text-gray-700",
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let mounted = true;
    apiClient.get("/admin/audit").then((res) => {
      if (!mounted) return;
      setLogs(res.data || []);
    }).catch(() => {
      if (mounted) toast.error("Failed to load audit logs");
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const uniqueActions = [...new Set(logs.map((l) => l.action))];

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = l.action?.toLowerCase().includes(q) || l.performedBy?.toLowerCase().includes(q) || l.status?.toLowerCase().includes(q);
    const matchAction = !actionFilter || l.action === actionFilter;
    return matchSearch && matchAction;
  }).sort((a, b) => (b.id || 0) - (a.id || 0));

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ClipboardList className="text-3xl text-slate-700" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Audit Logs</h1>
                <p className="text-sm text-slate-400">{filtered.length} log entries</p>
              </div>
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2.5 rounded-2xl border text-sm font-medium flex items-center gap-2 transition ${showFilters ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
              <Filter size={16} /> Filters <ChevronDown size={14} />
            </button>
          </div>

          {/* SEARCH + FILTERS */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search by action, user, or status..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-300 rounded-2xl pl-11 pr-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          {showFilters && (
            <div className="mb-5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-sm font-medium text-slate-600 mb-1">Filter by Action</label>
              <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="border border-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full max-w-xs">
                <option value="">All Actions</option>
                {uniqueActions.map((a) => <option key={a} value={a}>{a.replace(/_/g, " ")}</option>)}
              </select>
            </div>
          )}

          {/* LOG ENTRIES */}
          <div className="space-y-2">
            {filtered.map((l, i) => (
              <div key={l.id || i} className="flex items-center justify-between bg-slate-50 rounded-2xl px-5 py-3.5 border border-slate-200 hover:bg-slate-100 transition">
                <div className="flex items-center gap-4 flex-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${actionColor[l.action] || "bg-slate-200 text-slate-700"}`}>
                    {l.action?.replace(/_/g, " ") || "UNKNOWN"}
                  </span>
                  <div>
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">By:</span> {l.performedBy || "System"}
                    </p>
                    <p className="text-xs text-slate-400">
                      Status: {l.status || "—"} &middot; {l.timestamp ? new Date(l.timestamp).toLocaleString() : "—"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-center text-slate-400 py-12">No audit logs found</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
