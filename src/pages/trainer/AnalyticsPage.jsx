import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { getTrainerAnalytics, getTrainerClients, getClientActivityLogs, getTrainerTemplates } from '../../lib/dbService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, Dumbbell, MessageCircle } from 'lucide-react';

const COLORS = ['#00D4AA', '#A855F7', '#F97316', '#6B7280'];

export default function AnalyticsPage() {
  const user = useStore(s => s.user);
  const [metrics, setMetrics] = useState({ activeClients: 0, workoutPlans: 0, mealPlans: 0, messagesSent: 0 });
  const [clientData, setClientData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const loadData = async () => {
      setLoading(true);
      // Fetch overview metrics
      const analytics = await getTrainerAnalytics(user.uid);
      if (analytics) {
        setMetrics(analytics);
      }

      // Fetch pie chart data (Assignment breakdown)
      // We will just mock the "goals" and "notes" for now or fetch them if possible
      setPieData([
        { name: 'Workout Plans', value: analytics?.workoutPlans || 0 },
        { name: 'Meal Plans', value: analytics?.mealPlans || 0 },
        { name: 'Goals', value: 0 },
        { name: 'Notes', value: 0 }
      ]);

      // Fetch clients and their activity
      const clients = await getTrainerClients(user.uid);
      const enrichedClients = [];
      const aggregateWorkouts = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0 };

      for (const conn of clients) {
        const clientInfo = conn.user_profiles;
        if (!clientInfo) continue;
        
        const logs = await getClientActivityLogs(conn.user_id, 30);
        
        const workoutsCount = logs.workouts.length;
        const mealsCount = logs.foods.length;
        const lastActive = workoutsCount > 0 
          ? new Date(logs.workouts[0].timestamp).toLocaleDateString() 
          : 'Never';

        enrichedClients.push({
          id: conn.user_id,
          name: clientInfo.full_name || clientInfo.nickname || 'Unknown',
          lastActive,
          workoutsCount,
          mealsCount,
          planAssigned: 'Yes' // Mocked for now, need to check trainer_assignments
        });

        // Group workouts into weeks for the chart
        const now = Date.now();
        logs.workouts.forEach(w => {
          const diffDays = (now - w.timestamp) / (1000 * 60 * 60 * 24);
          if (diffDays <= 7) aggregateWorkouts['Week 4']++;
          else if (diffDays <= 14) aggregateWorkouts['Week 3']++;
          else if (diffDays <= 21) aggregateWorkouts['Week 2']++;
          else if (diffDays <= 28) aggregateWorkouts['Week 1']++;
        });
      }

      setClientData(enrichedClients.sort((a,b) => b.workoutsCount - a.workoutsCount));
      setChartData(Object.keys(aggregateWorkouts).map(k => ({ week: k, workouts: aggregateWorkouts[k] })));
      setLoading(false);
    };

    loadData();
  }, [user]);

  if (loading) return <div className="animate-pulse p-8"><div className="h-8 bg-surface rounded w-48 mb-8" /><div className="grid grid-cols-4 gap-4"><div className="h-32 bg-surface rounded-2xl" /><div className="h-32 bg-surface rounded-2xl" /><div className="h-32 bg-surface rounded-2xl" /><div className="h-32 bg-surface rounded-2xl" /></div></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-foreground">Analytics</h1>
        <p className="text-muted text-sm">Monitor business growth and client compliance.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Active Clients" value={metrics.activeClients} icon={Users} color="text-acid-green" bg="bg-acid-green/10" />
        <MetricCard title="Workout Plans" value={metrics.workoutPlans} icon={Dumbbell} color="text-purple-500" bg="bg-purple-500/10" />
        <MetricCard title="Meal Plans" value={metrics.mealPlans} icon={FileText} color="text-orange-500" bg="bg-orange-500/10" />
        <MetricCard title="Messages Sent" value={metrics.messagesSent} icon={MessageCircle} color="text-blue-500" bg="bg-blue-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Client Progress Chart */}
        <div className="lg:col-span-2 bg-surface border border-card-border p-6 rounded-3xl">
          <h3 className="font-black mb-6">Client Progress (Last 30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="week" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#222'}} contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
                <Bar dataKey="workouts" fill="#00D4AA" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assignment Breakdown */}
        <div className="bg-surface border border-card-border p-6 rounded-3xl flex flex-col">
          <h3 className="font-black mb-6">Assignment Breakdown</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs font-bold">
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00D4AA]" /> Workouts</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#A855F7]" /> Meals</div>
          </div>
        </div>
      </div>

      {/* Client Activity Table */}
      <div className="bg-surface border border-card-border rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-card-border">
          <h3 className="font-black">Client Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-card-bg text-muted font-bold text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4">Workouts (30d)</th>
                <th className="px-6 py-4">Meals (30d)</th>
                <th className="px-6 py-4">Plan Assigned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {clientData.map((c, i) => (
                <tr key={i} className="hover:bg-card-bg/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">{c.name}</td>
                  <td className="px-6 py-4 text-muted">{c.lastActive}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-acid-green/10 text-acid-green rounded-lg font-bold">{c.workoutsCount}</span></td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-purple-500/10 text-purple-500 rounded-lg font-bold">{c.mealsCount}</span></td>
                  <td className="px-6 py-4 text-muted">{c.planAssigned}</td>
                </tr>
              ))}
              {clientData.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-muted">No client activity found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-surface border border-card-border p-5 rounded-3xl">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-xl ${bg} ${color}`}><Icon className="w-5 h-5" /></div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-muted">{title}</h3>
      </div>
      <div className="text-3xl font-black text-foreground mt-2">{value}</div>
    </div>
  );
}

