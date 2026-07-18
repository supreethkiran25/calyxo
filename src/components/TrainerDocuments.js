import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Trash2, Plus, File, Image as ImageIcon, Search, Activity, X, Upload, Eye } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function TrainerDocuments({ user, clients }) {
  const [activeClient, setActiveClient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Upload Form
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('OTHER');
  const [selectedFile, setSelectedFile] = useState(null);

  const activeClientsList = React.useMemo(() => clients?.filter(c => c.status === 'ACTIVE') || [], [clients]);

  useEffect(() => {
    if (activeClientsList.length > 0 && !activeClient) {
      setTimeout(() => setActiveClient(activeClientsList[0]), 0);
    }
  }, [activeClientsList, activeClient]);

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from('trainer_documents')
        .select('*')
        .eq('trainer_id', user.uid)
        .eq('client_id', activeClient.clientId)
        .order('created_at', { ascending: false });
      
      setDocuments(data || []);
      setIsLoading(false);
    };

    if (activeClient && user?.uid) {
      fetchDocuments();
    }
  }, [activeClient, user]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !selectedFile || !activeClient) return;

    setIsUploading(true);

    try {
      // 1. Upload to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.uid}/${activeClient.clientId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('trainer-documents')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // 2. Get Public URL (or signed URL for secure documents)
      const { data: { publicUrl } } = supabase.storage
        .from('trainer-documents')
        .getPublicUrl(fileName);

      // 3. Save to database
      const { error: dbError } = await supabase.from('trainer_documents').insert({
        trainer_id: user.uid,
        client_id: activeClient.clientId,
        title,
        document_type: docType,
        file_url: publicUrl,
        file_size_bytes: selectedFile.size
      });

      if (dbError) throw dbError;

      setShowUploadModal(false);
      setTitle(''); setSelectedFile(null);
      fetchDocuments();
    } catch (err) {
      alert("Error uploading document: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteDocument = async (id, fileUrl) => {
    if (window.confirm("Permanently delete this document?")) {
      try {
        // Delete from DB
        await supabase.from('trainer_documents').delete().eq('id', id);
        
        // Delete from Storage
        const path = fileUrl.split('trainer-documents/')[1];
        if (path) {
          await supabase.storage.from('trainer-documents').remove([path]);
        }
        
        fetchDocuments();
      } catch (err) {
        console.error("Delete error", err);
      }
    }
  };

  const getDocIcon = (type) => {
    if (type === 'IMAGE') return <ImageIcon className="w-6 h-6 text-blue-500" />;
    if (type === 'MEDICAL') return <Activity className="w-6 h-6 text-red-500" />;
    return <FileText className="w-6 h-6 text-muted" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">Document Vault</h1>
          <p className="text-muted text-sm">Securely store and share client assessments, contracts, and reports.</p>
        </div>
        {activeClient && (
          <button 
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-xl flex items-center justify-center gap-2 border-none cursor-pointer shadow-lg shadow-blue-500/20 transition-all"
          >
            <Upload className="w-4 h-4" /> Upload Document
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Client Selector */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-surface border border-card-border rounded-3xl p-4 overflow-hidden">
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 px-2">Select Client</h3>
            <div className="space-y-2">
              {activeClientsList.map(c => (
                <div 
                  key={c.clientId}
                  onClick={() => setActiveClient(c)}
                  className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${activeClient?.clientId === c.clientId ? 'bg-blue-500/10 text-blue-500 font-bold border border-blue-500/30' : 'hover:bg-card-bg text-muted border border-transparent'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${activeClient?.clientId === c.clientId ? 'bg-blue-500 text-white' : 'bg-card-border text-foreground'}`}>
                    {c.name.charAt(0)}
                  </div>
                  <span className="truncate">{c.name}</span>
                </div>
              ))}
              {activeClientsList.length === 0 && (
                <div className="text-center text-xs text-muted py-8">No active clients.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Document Grid */}
        <div className="lg:col-span-3">
          {activeClient ? (
            <div className="bg-surface border border-card-border p-6 rounded-3xl shadow-sm min-h-[500px]">
              
              {isLoading ? (
                <div className="text-center text-muted py-12">Loading documents...</div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted opacity-50">
                  <File className="w-12 h-12 mb-4" />
                  <p className="font-bold">No documents found.</p>
                  <p className="text-xs">Upload medical reports, DEXA scans, or contracts.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {documents.map(doc => (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={doc.id} className="bg-card-bg border border-card-border p-4 rounded-2xl flex flex-col group">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-3 bg-surface rounded-xl">
                          {getDocIcon(doc.document_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-foreground truncate" title={doc.title}>{doc.title}</h4>
                          <p className="text-[10px] text-muted font-bold uppercase tracking-wider">{doc.document_type}</p>
                          <p className="text-[10px] text-muted mt-1">{new Date(doc.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-auto pt-4 border-t border-card-border">
                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="flex-1 py-1.5 text-xs font-bold bg-blue-500/10 text-blue-500 rounded cursor-pointer border-none flex justify-center items-center gap-1 hover:bg-blue-500 hover:text-white transition-colors no-underline">
                          <Eye className="w-3 h-3" /> View
                        </a>
                        <button onClick={() => deleteDocument(doc.id, doc.file_url)} className="px-3 py-1.5 bg-surface text-muted hover:text-destructive border border-card-border rounded cursor-pointer transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted border border-dashed border-card-border rounded-3xl p-12 text-center">
              Select a client to view or upload documents.
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card-bg w-full max-w-md rounded-3xl border border-card-border p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-card-border pb-4">
              <h2 className="text-xl font-black flex items-center gap-2"><Upload className="w-5 h-5 text-blue-500" /> Upload Document</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-muted hover:text-foreground cursor-pointer border-none bg-transparent">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Document Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. October DEXA Scan" className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Document Category</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner">
                  <option value="MEDICAL">Medical Report</option>
                  <option value="ASSESSMENT">Physical Assessment</option>
                  <option value="CONTRACT">Contract / Consent</option>
                  <option value="IMAGE">Progress Photo</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">File</label>
                <input type="file" required onChange={handleFileChange} className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20" />
              </div>

              <div className="pt-4 border-t border-card-border">
                <button type="submit" disabled={isUploading} className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 border-none cursor-pointer flex justify-center items-center gap-2">
                  {isUploading ? 'Uploading...' : 'Save to Vault'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
