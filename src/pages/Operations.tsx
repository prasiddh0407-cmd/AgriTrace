import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, ProduceBatch, SupplyChainLog } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { generateBlockchainHash, cn } from '../lib/utils';
import { 
  IconSearch, 
  IconTruck, 
  IconStore, 
  IconDatabase, 
  IconShield,
  IconArrowRight
} from '../icons';

export default function OperationDashboard() {
  const { profile } = useAuth();
  const [batchId, setBatchId] = useState('');
  const [currentBatch, setCurrentBatch] = useState<ProduceBatch | null>(null);
  const [logs, setLogs] = useState<SupplyChainLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<SupplyChainLog['status']>('In Transit');

  const fetchBatchDetails = async (id: string) => {
    setLoading(true);
    const { data: batch } = await supabase
      .from('produce_batches')
      .select('*')
      .eq('id', id)
      .single();

    if (batch) {
      setCurrentBatch(batch);
      const { data: logList } = await supabase
        .from('supply_chain_logs')
        .select('*')
        .eq('batch_id', id)
        .order('created_at', { ascending: false });
      
      if (logList) setLogs(logList);
    } else {
      setCurrentBatch(null);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBatch || !profile) return;
    setUpdating(true);

    try {
      const hash = await generateBlockchainHash({ 
        batchId: currentBatch.id, 
        status, 
        location,
        timestamp: new Date() 
      });

      const { error } = await supabase.from('supply_chain_logs').insert([{
        batch_id: currentBatch.id,
        status,
        location,
        blockchain_hash: hash,
        updated_by: profile.id,
      }]);

      if (error) throw error;
      
      setLocation('');
      fetchBatchDetails(currentBatch.id);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-24 py-12">
      <header className="space-y-8">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mix-blend-overlay">TRANSIT.</h1>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="relative flex-1">
            <IconSearch className="absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7 text-text-muted" />
            <input
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              placeholder="ENTER BATCH IDENTIFIER..."
              className="w-full bg-[#0d0d0d] border-2 border-border px-16 py-6 focus:border-primary outline-none font-mono text-xl text-white shadow-inner"
            />
          </div>
          <button
            onClick={() => fetchBatchDetails(batchId)}
            className="bronze-btn text-xl px-12"
          >
            Bridge Data
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {currentBatch ? (
          <motion.div
            key={currentBatch.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-12"
          >
            <div className="md:col-span-8 space-y-12">
              <div className="tactile-card-slate p-12 space-y-12">
                <div className="flex items-center justify-between pb-8 border-b border-white/5">
                  <div className="space-y-2">
                    <h2 className="text-5xl font-bold tracking-tighter text-white">{currentBatch.crop_type}</h2>
                    <div className="etched-metal text-primary/60 border-primary/20">UUID: {currentBatch.id}</div>
                  </div>
                  <div className="p-6 bg-black/40 border border-white/5 text-primary shadow-inner">
                    {status === 'In Transit' ? <IconTruck className="w-12 h-12" /> : <IconStore className="w-12 h-12" />}
                  </div>
                </div>

                <form onSubmit={handleStatusUpdate} className="space-y-12">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                      <div className="space-y-4">
                         <label className="etched-metal">Action Designation</label>
                         <select 
                           value={status}
                           onChange={(e) => setStatus(e.target.value as any)}
                           className="w-full bg-black/40 border border-border px-6 py-4 focus:border-primary outline-none text-white font-mono"
                         >
                            <option value="In Transit">Update Transit State</option>
                            <option value="Shelf">Commit to Retail</option>
                         </select>
                      </div>
                      <div className="space-y-4">
                         <label className="etched-metal">Node Location</label>
                         <div className="relative">
                            <input 
                              required
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              placeholder="City, Warehouse Code..."
                              className="w-full bg-black/40 border border-border px-6 py-4 focus:border-primary outline-none text-white font-mono"
                            />
                         </div>
                      </div>
                   </div>

                   <button
                    disabled={updating}
                    className="bronze-btn w-full text-xl"
                   >
                     {updating ? 'EX_PROC_COMMIT...' : 'Commit Signed Logic to Chain'}
                   </button>
                </form>
              </div>

              <div className="space-y-8">
                <h3 className="text-2xl font-bold tracking-tighter flex items-center gap-4">
                  <IconDatabase className="w-8 h-8 text-primary" /> Verified Action History
                </h3>
                <div className="flex flex-col gap-4">
                  {logs.map((log) => (
                    <div key={log.id} className="tactile-card-slate bg-black/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-white/5">
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "etched-metal",
                          log.status === 'Harvested' ? "border-emerald-500/20 text-emerald-500" :
                          log.status === 'In Transit' ? "border-amber-500/20 text-amber-500" :
                          "border-blue-500/20 text-blue-500"
                        )}>
                          {log.status}
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">{log.location}</span>
                      </div>
                      <span className="mono-data text-text-muted text-[10px] opacity-40">{log.blockchain_hash}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-4 space-y-12">
              <div className="tactile-card-olive p-10 space-y-6">
                <h4 className="etched-metal">Network Integrity</h4>
                <div className="space-y-6 pt-4">
                   <div className="bg-black/40 p-6 border border-white/5 shadow-inner space-y-4">
                      <div className="flex items-center gap-4 text-xs font-mono font-bold text-primary">
                         <IconDatabase className="w-5 h-5" /> NODE_001_SYNC
                      </div>
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-primary animate-pulse" />
                        <span className="text-[10px] font-mono text-text-muted tracking-widest uppercase">P2P Verification Active</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="p-8 tactile-card-slate border-amber-900/30 bg-amber-950/10 space-y-6">
                 <div className="flex items-center gap-4 text-amber-600">
                    <IconShield className="w-6 h-6" />
                    <span className="font-bold uppercase tracking-widest text-xs">Immutable Ledger</span>
                 </div>
                 <p className="font-mono text-xs text-text-dim leading-relaxed italic opacity-70">
                    Warning: Once committed, logs are sealed into the AgriTrace protocol. Attempting to spoof data will trigger a node auto-quarantine.
                 </p>
              </div>
            </div>
          </motion.div>
        ) : batchId && !loading ? (
             <div className="text-center py-24 tactile-card-slate border-dashed bg-black/5 opacity-80">
                <IconSearch className="w-16 h-16 text-text-muted mx-auto mb-6" />
                <div className="space-y-2">
                   <p className="text-3xl font-bold tracking-tighter">Null Node</p>
                   <p className="text-text-muted font-mono text-sm">Batch identifier not registered in protocol index.</p>
                </div>
             </div>
        ) : (
          <div className="text-center py-24 tactile-card-slate bg-slate-900 border-white/5 opacity-40">
             <IconTruck className="w-16 h-16 text-text-muted mx-auto mb-6" />
             <p className="text-xl font-bold tracking-tighter mix-blend-overlay">Enter Batch ID to bridge system resources</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
