import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { getTrainerClients, getClientActivityLogs, assignPlan, getUserAssignments } from '../../lib/dbService';
import { Sparkles, Save, FileText, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AIReportsPage() {
  const user = useStore(s => s.user);
  
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [reportType, setReportType] = useState('Progress Report');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportResult, setReportResult] = useState('');
  const [pastReports, setPastReports] = useState([]);
  
  const [expandedReportId, setExpandedReportId] = useState(null);

  useEffect(() => {
    if(!user?.uid) return;
    const loadData = async () => {
      const c = await getTrainerClients(user.uid);
      setClients(c);
    };
    loadData();
  }, [user]);

  useEffect(() => {
    const loadReports = async () => {
      if(!selectedClient) {
        setPastReports([]);
        return;
      }
      const a = await getUserAssignments(selectedClient);
      const reports = a.filter(x => x.type === 'note' && x.title.includes('AI Report')).sort((a,b) => new Date(b.assigned_at) - new Date(a.assigned_at));
      setPastReports(reports);
    };
    loadReports();
  }, [selectedClient]);

  const handleGenerate = async () => {
    if(!selectedClient) return alert('Select a client first');
    setIsGenerating(true);
    setReportResult('');
    
    try {
      const logs = await getClientActivityLogs(selectedClient, 30);
      const res = await fetch('/api/gemini/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          workouts: logs.workouts,
          foods: logs.foods
        })
      });
      const data = await res.json();
      if(data.error) throw new Error(data.error);
      setReportResult(data.report);
    } catch (e) {
      alert('Error generating report: ' + e.message);
    }
    setIsGenerating(false);
  };

  const handleSaveReport = async () => {
    if(!reportResult || !selectedClient) return;
    await assignPlan(user.uid, selectedClient, {
      type: 'note',
      title: `AI Report: ${reportType}`,
      content: { text: reportResult }
    });
    alert('Report saved to client notes!');
    // Reload past reports
    const a = await getUserAssignments(selectedClient);
    const reports = a.filter(x => x.type === 'note' && x.title.includes('AI Report')).sort((a,b) => new Date(b.assigned_at) - new Date(a.assigned_at));
    setPastReports(reports);
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-black text-foreground">AI Reports</h1>
        <p className="text-muted text-sm">Generate automated insights on client progress using Calyxo AI.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Generator Form */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-surface border border-card-border p-6 rounded-3xl space-y-4">
            <h2 className="font-black text-xl mb-4">Generate Report</h2>
            
            <div>
              <label className="block text-xs font-bold text-muted mb-2 uppercase">Client</label>
              <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="w-full bg-card-bg border border-card-border rounded-xl p-3 text-foreground font-bold outline-none focus:border-acid-green">
                <option value="">Select Client...</option>
                {clients.map(c => <option key={c.id} value={c.user_id}>{c.user_profiles?.full_name || 'Client'}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-muted mb-2 uppercase">Report Type</label>
              <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full bg-card-bg border border-card-border rounded-xl p-3 text-foreground font-bold outline-none focus:border-acid-green">
                <option value="Progress Report">Progress Report</option>
                <option value="Nutrition Analysis">Nutrition Analysis</option>
                <option value="Workout Consistency">Workout Consistency</option>
                <option value="Overall Health Summary">Overall Health Summary</option>
              </select>
            </div>

            <button 
              onClick={handleGenerate} 
              disabled={isGenerating || !selectedClient}
              className="w-full bg-acid-green text-black py-3 rounded-xl font-black border-none hover:bg-[#00b894] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {isGenerating ? 'Generating...' : <><Sparkles className="w-4 h-4"/> Generate Insights</>}
            </button>
          </div>

          {/* Past Reports List */}
          {selectedClient && (
            <div className="bg-surface border border-card-border p-6 rounded-3xl">
              <h2 className="font-black text-xl mb-4">Past Reports</h2>
              {pastReports.length === 0 && <p className="text-muted text-sm font-bold">No past reports for this client.</p>}
              <div className="space-y-3">
                {pastReports.map(pr => (
                  <div key={pr.id} className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
                    <button 
                      onClick={() => setExpandedReportId(expandedReportId === pr.id ? null : pr.id)}
                      className="w-full p-4 flex justify-between items-center text-left hover:bg-surface transition-colors"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{pr.title}</h4>
                        <span className="text-xs text-muted font-bold">{new Date(pr.assigned_at).toLocaleDateString()}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted transition-transform ${expandedReportId === pr.id ? 'rotate-180' : ''}`}/>
                    </button>
                    {expandedReportId === pr.id && (
                      <div className="p-4 border-t border-card-border prose prose-invert max-w-none prose-sm">
                        <ReactMarkdown>{pr.content?.text || ''}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Report Preview Panel */}
        <div className="w-full lg:w-2/3 bg-surface border border-card-border rounded-3xl p-6 flex flex-col min-h-[500px]">
          <div className="flex justify-between items-center border-b border-card-border pb-4 mb-4 shrink-0">
            <h2 className="font-black text-xl flex items-center gap-2"><FileText className="w-5 h-5 text-acid-green"/> Report Preview</h2>
            {reportResult && (
              <button onClick={handleSaveReport} className="bg-card-bg text-foreground border border-card-border px-4 py-2 rounded-xl font-bold text-sm hover:bg-surface transition-colors flex items-center gap-2">
                <Save className="w-4 h-4"/> Save to Notes
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {isGenerating && (
              <div className="h-full flex flex-col items-center justify-center text-muted gap-4">
                <Sparkles className="w-10 h-10 animate-pulse text-acid-green" />
                <p className="font-bold animate-pulse text-acid-green">Calyxo AI is analyzing 30 days of client data...</p>
              </div>
            )}
            
            {!isGenerating && !reportResult && (
              <div className="h-full flex flex-col items-center justify-center text-muted opacity-50">
                <FileText className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-black">No Report Generated</h3>
                <p className="text-sm text-center max-w-md mt-2">Select a client and click Generate Insights to analyze their workout and nutrition logs.</p>
              </div>
            )}
            
            {!isGenerating && reportResult && (
              <div className="prose prose-invert prose-acid-green max-w-none prose-h1:text-2xl prose-h2:text-xl">
                <ReactMarkdown>{reportResult}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

