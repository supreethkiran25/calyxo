import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { getTrainerClients, getTrainerDocuments, uploadTrainerDocument, deleteTrainerDocument } from '../../lib/dbService';
import { UploadCloud, File, Trash2, Download, Search } from 'lucide-react';

export default function DocumentsPage() {
  const user = useStore(s => s.user);
  
  const [clients, setClients] = useState([]);
  const [documents, setDocuments] = useState([]);
  
  const [fClient, setFClient] = useState('');
  const [fCategory, setFCategory] = useState('other');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if(!user?.uid) return;
      const c = await getTrainerClients(user.uid);
      setClients(c);
      const d = await getTrainerDocuments(user.uid);
      setDocuments(d);
    };
    loadData();
  }, [user?.uid]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    if(file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit');
      return;
    }
    
    setUploading(true);
    try {
      await uploadTrainerDocument(user.uid, file, { clientId: fClient, category: fCategory });
      alert('File uploaded successfully!');
      const d = await getTrainerDocuments(user.uid);
      setDocuments(d);
    } catch(err) {
      alert('Upload failed: ' + err.message);
    }
    setUploading(false);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (docId, url) => {
    if(window.confirm('Delete this document permanently?')) {
      await deleteTrainerDocument(docId, url);
      const d = await getTrainerDocuments(user.uid);
      setDocuments(d);
    }
  };

  const filteredDocs = documents.filter(d => {
    if(!filterQuery) return true;
    const s = filterQuery.toLowerCase();
    return d.file_name?.toLowerCase().includes(s) || d.category?.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-black text-foreground">Documents Vault</h1>
        <p className="text-muted text-sm">Securely store and share contracts, assessments, and plans.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Upload Panel */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-surface border border-card-border rounded-3xl p-6">
            <h2 className="font-black text-xl mb-4">Upload File</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase">Assign to Client (Optional)</label>
                <select value={fClient} onChange={e=>setFClient(e.target.value)} className="w-full bg-card-bg border border-card-border rounded-xl p-3 text-foreground font-bold outline-none">
                  <option value="">None</option>
                  {clients.map(c => <option key={c.id} value={c.user_id}>{c.user_profiles?.full_name || 'Client'}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase">Category</label>
                <select value={fCategory} onChange={e=>setFCategory(e.target.value)} className="w-full bg-card-bg border border-card-border rounded-xl p-3 text-foreground font-bold outline-none">
                  <option value="contract">Contract</option>
                  <option value="assessment">Assessment</option>
                  <option value="plan">Plan</option>
                  <option value="certificate">Certificate</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed border-card-border rounded-2xl p-8 text-center cursor-pointer transition-colors ${uploading ? 'opacity-50' : 'hover:border-acid-green hover:bg-acid-green/5'}`}
              >
                <UploadCloud className="w-8 h-8 text-muted mx-auto mb-2" />
                <div className="font-bold text-sm">{uploading ? 'Uploading...' : 'Click to select file'}</div>
                <div className="text-xs text-muted mt-1">PDF, DOC, JPG/PNG up to 5MB</div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" />
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="w-full lg:w-2/3 bg-surface border border-card-border rounded-3xl p-6 flex flex-col h-[600px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-black text-xl">My Files</h2>
            <div className="relative w-48">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input 
                value={filterQuery} onChange={e=>setFilterQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-card-bg border border-card-border rounded-xl py-2 pl-9 pr-3 text-sm font-bold outline-none focus:border-acid-green" 
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
            {filteredDocs.length === 0 && <div className="text-center text-muted font-bold py-10 border border-dashed border-card-border rounded-2xl">No documents found.</div>}
            
            {filteredDocs.map(d => {
              const clientName = clients.find(c => c.user_id === d.client_id)?.user_profiles?.full_name || 'No Client';
              return (
                <div key={d.id} className="bg-card-bg border border-card-border p-4 rounded-2xl flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-surface rounded-xl"><File className="w-6 h-6 text-acid-green"/></div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{d.file_name}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs font-bold text-muted">
                        <span className="uppercase text-acid-green">{d.category}</span>
                        {d.client_id && <span>â€¢ Client: {clientName}</span>}
                        <span>â€¢ {(d.file_size / 1024).toFixed(0)} KB</span>
                        <span>â€¢ {new Date(d.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={d.file_url} target="_blank" rel="noreferrer" download className="p-2 bg-surface hover:text-acid-green rounded-lg transition-colors"><Download className="w-4 h-4"/></a>
                    <button onClick={() => handleDelete(d.id, d.file_url)} className="p-2 bg-surface hover:text-destructive rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
