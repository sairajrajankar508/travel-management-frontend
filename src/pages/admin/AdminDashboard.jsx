import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, ShieldCheck, ClipboardList, DollarSign,
  Building2, Clock, ChevronRight,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#64748b", "#14b8a6", "#6366f1"];

const statusColor = {
  DRAFT: "bg-gray-100 text-gray-700", SUBMITTED: "bg-blue-100 text-blue-700",
  POLICY_VALIDATION: "bg-orange-100 text-orange-700", MANAGER_REVIEW: "bg-amber-100 text-amber-700",
  MANAGER_APPROVED: "bg-teal-100 text-teal-700", FINANCE_REVIEW: "bg-purple-100 text-purple-700", FINANCE_APPROVED: "bg-green-100 text-green-700",
  COMPLETED: "bg-emerald-100 text-emerald-700", REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-700",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [requests, setRequests] = useState([]);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiClient.get("/admin/reports"),
      apiClient.get("/admin/users"),
      apiClient.get("/admin/department"),
      apiClient.get("/admin/policy"),
      apiClient.get("/admin/requests"),
      apiClient.get("/admin/audit"),
    ]).then(([s, u, d, p, r, a]) => {
      if (!mounted) return;
      setStats(s.data);
      setUsers(u.data || []);
      setDepartments(d.data || []);
      setPolicies(p.data || []);
      setRequests(r.data || []);
      setAudits(a.data || []);
    }).catch(() => {}).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  }

  // Derived chart data
  const deptMap = {};
  requests.forEach((r) => {
    const dept = r.user?.department || r.department || "Unknown";
    if (!deptMap[dept]) deptMap[dept] = 0;
    deptMap[dept]++;
  });
  const deptData = Object.entries(deptMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const statusCount = {};
  requests.forEach((r) => {
    const s = r.status || "DRAFT";
    statusCount[s] = (statusCount[s] || 0) + 1;
  });
  const pieData = Object.entries(statusCount).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));

  const cards = [
    { label: "Total Users", value: users.length, icon: Users, color: "bg-blue-500", path: "/admin/users" },
    { label: "Total Requests", value: requests.length, icon: ClipboardList, color: "bg-indigo-500", path: "/admin/requests" },
    { label: "Departments", value: departments.length, icon: Building2, color: "bg-purple-500", path: "/admin/departments" },
    { label: "Policies", value: policies.length, icon: ShieldCheck, color: "bg-amber-500", path: "/admin/policies" },
  ];

  const last5 = (arr, key = "id") => arr?.slice(-5).reverse() || [];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-3xl text-slate-700" />
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c) => (
            <div key={c.label} onClick={() => navigate(c.path)} className="bg-white rounded-2xl shadow-md border border-slate-200 p-5 flex items-center gap-4 cursor-pointer hover:shadow-lg hover:border-blue-200 transition">
              <div className={`${c.color} p-3 rounded-xl text-white`}><c.icon size={24} /></div>
              <div>
                <p className="text-sm text-slate-500">{c.label}</p>
                <p className="text-2xl font-bold text-slate-800">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Building2 size={20} /> Department Activity</h2>
            {deptData.length === 0 ? <p className="text-slate-400 text-center py-12">No data yet</p> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={deptData} layout="vertical" margin={{ left: 100, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90} />
                  <Tooltip formatter={(v) => [`${v} requests`, "Total"]} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 6, 6, 0]} name="Requests" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><ClipboardList size={20} /> Request Status</h2>
            {pieData.length === 0 ? <p className="text-slate-400 text-center py-12">No data yet</p> : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* SECTION PREVIEWS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* USERS PREVIEW */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><Users size={17} /> Recent Users</h2>
              <button onClick={() => navigate("/admin/users")} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-medium">View All <ChevronRight size={13} /></button>
            </div>
            {last5(users).length === 0 ? <p className="text-slate-400 text-center py-6 text-sm">No users</p> : (
              <div className="space-y-2">
                {last5(users).map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${u.role === "ADMIN" ? "bg-red-500" : u.role === "MANAGER" ? "bg-purple-500" : u.role === "FINANCE" ? "bg-amber-500" : "bg-blue-500"}`}>
                        {(u.name || "U").charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{u.role}</span>
                      <span className={`w-2 h-2 rounded-full ${u.active !== false ? "bg-green-500" : "bg-red-500"}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DEPARTMENTS PREVIEW */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><Building2 size={17} /> Departments</h2>
              <button onClick={() => navigate("/admin/departments")} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-medium">View All <ChevronRight size={13} /></button>
            </div>
            {last5(departments).length === 0 ? <p className="text-slate-400 text-center py-6 text-sm">No departments</p> : (
              <div className="space-y-2">
                {last5(departments).map((d) => (
                  <div key={d.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{d.name}</p>
                      <p className="text-xs text-slate-400">HOD: {d.hodName || "Not assigned"}</p>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${d.active !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {d.active !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* POLICIES PREVIEW */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><ShieldCheck size={17} /> Travel Policies</h2>
              <button onClick={() => navigate("/admin/policies")} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-medium">View All <ChevronRight size={13} /></button>
            </div>
            {last5(policies).length === 0 ? <p className="text-slate-400 text-center py-6 text-sm">No policies</p> : (
              <div className="space-y-2">
                {last5(policies).map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{p.policyName || p.allowedClass || "Standard"} Class</p>
                      <p className="text-xs text-slate-400">₹{p.maxBudget?.toLocaleString() || "0"} budget</p>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${p.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {p.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TRAVEL REQUESTS PREVIEW */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><ClipboardList size={17} /> Recent Requests</h2>
              <button onClick={() => navigate("/admin/requests")} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-medium">View All <ChevronRight size={13} /></button>
            </div>
            {last5(requests).length === 0 ? <p className="text-slate-400 text-center py-6 text-sm">No requests</p> : (
              <div className="space-y-2">
                {last5(requests).map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{r.destination || "—"}</p>
                      <p className="text-xs text-slate-400">{r.user?.name || "N/A"} · ₹{r.budget?.toLocaleString() || "0"}</p>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${statusColor[r.status] || "bg-slate-100 text-slate-700"}`}>
                      {r.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AUDIT LOGS PREVIEW */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><Clock size={17} /> Recent Activity</h2>
              <button onClick={() => navigate("/admin/audit")} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-medium">View All <ChevronRight size={13} /></button>
            </div>
            {last5(audits).length === 0 ? <p className="text-slate-400 text-center py-6 text-sm">No activity</p> : (
              <div className="space-y-2">
                {last5(audits).map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{a.action || "—"}</p>
                      <p className="text-xs text-slate-400">{a.performedBy || "SYSTEM"}</p>
                    </div>
                    <span className="text-xs text-slate-400">{a.timestamp ? new Date(a.timestamp).toLocaleString() : "—"}</span>
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

export default AdminDashboard;