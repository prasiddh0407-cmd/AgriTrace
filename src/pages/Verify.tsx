import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  IconShield, 
  IconSearch, 
  IconSprout, 
  IconTruck, 
  IconStore, 
  IconDatabase,
  IconArrowRight
} from '../icons';
import { supabase, ProduceBatch, SupplyChainLog } from '../lib/supabase';
import { formatDate, cn } from '../lib/utils';

export default function Verify() {
  const { batchId } = useParams();
  const [searchId, setSearchId] = useState(batchId || '');
  const [batch, setBatch] = useState<ProduceBatch | null>(null);
  const [logs, setLogs] = useState<SupplyChainLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchData = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError(false);
    
    try {
      const { data: batchData } = await supabase
        .from('produce_batches')
        .select('*')
        .eq('id', id)
        .single();

      if (batchData) {
        setBatch(batchData);
        const { data: logData } = await supabase
          .from('supply_chain_logs')
          .select('*')
          .eq('batch_id', id)
          .order('created_at', { ascending: true });
        
        if (logData) setLogs(logData);
      } else {
        setError(true);
        setBatch(null);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) {
      fetchData(batchId);
    }
  }, [batchId]);

  return (
    <div className="max-w-7xl mx-auto space-y-24 py-12">
      {!batchId && !batch && (
        <div className="text-center space-y-12 py-24 tactile-card-slate border-white/5">
           <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mix-blend-overlay">VERIFY.</h1>
              <p className="text-xl text-text-muted font-mono tracking-wide max-w-2xl mx-auto">ENTER A BATCH UNIQUE IDENTIFIER TO ESTABLISH CRYPTOGRAPHIC PROVENANCE.</p>
           </div>
           <div className="max-w-2xl mx-auto flex flex-col md:flex-row gap-6">
              <div className="relative flex-1">
                 <IconSearch className="absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7 text-text-muted" />
                 <input 
                   value={searchId}
                   onChange={(e) => setSearchId(e.target.value)}
                   className="w-full bg-[#0d0d0d] border border-border px-16 py-6 focus:border-primary outline-none text-white font-mono text-xl shadow-inner"
                   placeholder="e.g. j7x2n9"
                 />
              </div>
              <button 
                onClick={() => fetchData(searchId)}
                className="bronze-btn text-xl px-12"
              >
                Scan Node
              </button>
           </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-40 gap-12">
           <div className="w-24 h-24 border-2 border-primary/20 border-t-primary animate-spin" />
           <p className="mono-data text-primary text-sm tracking-[0.3em] animate-pulse">SYNCHRONIZING_DECENTRALIZED_LEDGER...</p>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-24 tactile-card-slate border-red-500/20 bg-red-950/5">
           <IconShield className="w-24 h-24 text-red-500 mx-auto mb-10 opacity-30 rotate-12" />
           <h2 className="text-5xl font-bold tracking-tighter text-white">INVALID_SEQUENCE</h2>
           <p className="text-text-muted font-mono mt-4">RECORD NOT LOCATED IN AGRITRACE PROTOCOL INDEX.</p>
           <button onClick={() => setError(false)} className="mt-12 bronze-btn">Reset Interface</button>
        </div>
      )}

      {batch && !loading && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-20"
        >
          <header className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-white/5 pb-10">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-9xl font-bold tracking-tighter mix-blend-overlay leading-none">PROVENANCE.</h1>
              <div className="flex items-center gap-6">
                 <div className="etched-metal">ID: <span className="text-primary">{batch.id}</span></div>
                 <div className="mono-data text-primary/60 text-xs">VERIFIED_PROTOCOL_ENTRY</div>
              </div>
            </div>
            <div className="tactile-card-olive p-10 flex flex-col items-center gap-4 bg-transparent border-primary/10">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary animate-pulse shadow-[0_0_8px_rgba(5,150,105,0.8)]" />
                  <span className="mono-data text-xs text-primary tracking-widest shadow-primary">STATUS: INTEGRITY_LOCKED</span>
               </div>
               <div className="text-[10px] mono-data text-text-dim opacity-50 uppercase">Ethereum Layer 2 Sec.</div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Details */}
            <div className="lg:col-span-4 space-y-12">
              <section className="tactile-card-slate p-12 space-y-10">
                <h3 className="etched-metal mb-4">BATCH_SIG_INFO</h3>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <p className="mono-data text-text-muted text-[10px]">Produce Designation</p>
                    <p className="text-5xl font-bold text-white tracking-tighter leading-tight italic">{batch.crop_type}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-8 py-8 border-t border-white/5">
                    <div className="space-y-2">
                      <p className="mono-data text-text-muted text-[10px]">Source Geometry</p>
                      <p className="text-2xl font-bold text-white flex items-center gap-4">Huila Region Node</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="tactile-card-olive p-12 space-y-6">
                <h3 className="mono-data text-primary text-[10px] uppercase tracking-widest bg-primary/10 p-2 text-center">MARGIN_TRANSPARENCY_SEAL</h3>
                <div className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <p className="text-6xl font-bold text-white leading-none tracking-tighter">18.0%</p>
                    <p className="mono-data text-xs text-primary italic opacity-70">Secured Producer Value</p>
                  </div>
                  <IconShield className="w-16 h-16 text-primary opacity-20" />
                </div>
                <div className="h-4 w-full bg-black/40 border border-white/5 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '18%' }}
                    transition={{ duration: 1.5, ease: 'circOut' }}
                    className="h-full bg-gradient-to-r from-primary/40 to-primary shadow-[0_0_15px_rgba(5,150,105,0.4)]" 
                  />
                </div>
              </section>

              <div className="px-4 py-8 border-l border-white/5 flex flex-col gap-4">
                <p className="mono-data text-text-muted text-[10px] uppercase tracking-widest">Master Protocol Hash</p>
                <div className="mono-data text-[10px] text-text-dim break-all leading-loose opacity-40 hover:opacity-80 transition-opacity cursor-copy">
                  {logs[0]?.blockchain_hash || 'PENDING_INIT_HASH...'}
                </div>
              </div>
            </div>

            {/* Right Column: Timeline */}
            <div className="lg:col-span-8 tactile-card-slate p-12 md:p-16 relative">
              <h3 className="text-4xl font-bold text-white tracking-tighter mb-16 flex items-center gap-6">
                 <IconDatabase className="w-10 h-10 text-primary" /> Immutable Journey
              </h3>
              
              <div className="relative flex flex-col gap-24 ml-2">
                <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-white/5" />

                {logs.map((log, i) => (
                  <div key={log.id} className="relative pl-24 group">
                    <div className={cn(
                      "absolute left-0 top-2 w-8 h-8 border-2 z-10 transition-all",
                      i === logs.length - 1 ? "bg-primary border-primary shadow-[0_0_25px_rgba(5,150,105,0.6)] scale-110" : "bg-bg-dark border-white/10"
                    )} />

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 border-l border-white/5 pl-12 -ml-12 border-none">
                      <div className="space-y-6 flex-1">
                        <div className="flex items-center gap-6">
                           <h4 className="text-4xl font-bold text-white tracking-tighter italic">{log.status}</h4>
                           <div className={cn(
                             "etched-metal text-[10px]",
                             log.status === 'Harvested' ? "border-emerald-500/20 text-emerald-500" :
                             log.status === 'In Transit' ? "border-amber-500/20 text-amber-500" :
                             "border-blue-500/20 text-blue-500"
                           )}>
                             SIG_VERIFIED
                           </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="p-3 bg-black/40 border border-white/5 text-primary">
                             {log.status === 'Harvested' ? <IconSprout className="w-6 h-6" /> : log.status === 'Shelf' ? <IconStore className="w-6 h-6" /> : <IconTruck className="w-6 h-6" />}
                           </div>
                           <p className="text-2xl font-bold tracking-tight text-white/90">{log.location}</p>
                        </div>
                        <div className="mono-data text-[10px] text-text-dim/40 bg-black/20 p-4 border border-white/5 hover:text-primary transition-colors cursor-default">
                           {log.blockchain_hash}
                        </div>
                      </div>
                      <div className="md:text-right">
                         <span className="mono-data text-xs text-text-muted opacity-60 font-bold">{formatDate(log.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* QR Overlay */}
              {batch.qr_code_url && (
                <div className="absolute top-16 right-16 hidden xl:flex flex-col items-center gap-4">
                  <div className="p-2 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform cursor-crosshair">
                    <img src={batch.qr_code_url} alt="QR" className="w-32 h-32 grayscale contrast-[2] brightness-[0.8]" />
                  </div>
                  <span className="mono-data text-[10px] tracking-[0.4em] opacity-30 font-bold">DIGITAL_PROOFS</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

