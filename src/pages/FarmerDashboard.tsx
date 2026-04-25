import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, ProduceBatch } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { cn, formatDate, generateBlockchainHash } from '../lib/utils';
import { 
  IconSprout, 
  IconSearch, 
  IconDatabase, 
  IconShield, 
  IconArrowRight 
} from '../icons';
import QRCode from 'qrcode';
import { connectWallet, createBatch, calculatePayment } from '../lib/blockchain';

export default function FarmerDashboard() {
  const { profile } = useAuth();
  const [batches, setBatches] = useState<ProduceBatch[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isBlockchainAdding, setIsBlockchainAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blockchainLoading, setBlockchainLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [totalPayment, setTotalPayment] = useState<string>('0');
  const [formData, setFormData] = useState({
    crop: '',
    farmer_price: '',
    retail_price: '',
  });
  const [blockchainFormData, setBlockchainFormData] = useState({
    crop: '',
    basePrice: '',
  });
  const [createdBatchId, setCreatedBatchId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBatches = async () => {
    const { data } = await supabase
      .from('produce_batches')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setBatches(data);
  };

  useEffect(() => {
    fetchBatches();
  }, [profile]);

  // Calculate total payment when base price changes
  useEffect(() => {
    const calculateTotal = async () => {
      if (blockchainFormData.basePrice) {
        try {
          const total = await calculatePayment(blockchainFormData.basePrice);
          setTotalPayment(total);
        } catch (error) {
          console.error('Error calculating payment:', error);
        }
      } else {
        setTotalPayment('0');
      }
    };
    calculateTotal();
  }, [blockchainFormData.basePrice]);

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      setWalletConnected(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Make sure MetaMask is installed.');
    }
  };

  const handleBlockchainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !walletConnected) return;
    setBlockchainLoading(true);

    try {
      const { signer } = await connectWallet();
      
      // Upload metadata to IPFS (using provided CID for now)
      const ipfsCID = import.meta.env.VITE_PINATA_CID;
      if (!ipfsCID) throw new Error('IPFS CID not configured');

      // Create batch on blockchain
      const tx = await createBatch(ipfsCID, blockchainFormData.basePrice, signer);
      
      // Also create in Supabase for UI
      const batchId = Math.random().toString(36).substring(7);
      const verificationUrl = `${window.location.origin}/verify/${batchId}`;
      const qrDataUrl = await QRCode.toDataURL(verificationUrl);

      const newBatch = {
        id: batchId,
        crop_type: blockchainFormData.crop,
        pricing_logic: {
          farmer_price: parseFloat(blockchainFormData.basePrice),
          retail_price: parseFloat(blockchainFormData.basePrice) * 1.5, // Example
          farmer_margin: 18,
        },
        qr_code_url: qrDataUrl,
      };

      const { error: batchError } = await supabase.from('produce_batches').insert([newBatch]);
      if (batchError) throw batchError;

      const hash = await generateBlockchainHash(newBatch);
      const { error: logError } = await supabase.from('supply_chain_logs').insert([{
        batch_id: batchId,
        status: 'Harvested',
        location: 'Source Farm',
        blockchain_hash: hash,
        updated_by: profile.id,
      }]);
      if (logError) throw logError;

      setBlockchainFormData({
        crop: '',
        basePrice: '',
      });
      setIsBlockchainAdding(false);
      fetchBatches();
      alert(`Batch created successfully! Transaction hash: ${tx.hash}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create blockchain batch. Check console for details.');
    } finally {
      setBlockchainLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      const fPrice = parseFloat(formData.farmer_price);
      const rPrice = parseFloat(formData.retail_price);
      const batchId = Math.random().toString(36).substring(7);
      
      const verificationUrl = `${window.location.origin}/verify/${batchId}`;
      const qrDataUrl = await QRCode.toDataURL(verificationUrl);

      const pricingLogic = {
        farmer_price: fPrice,
        retail_price: rPrice,
        farmer_margin: 18,
      };

      const newBatch = {
        id: batchId,
        crop_type: formData.crop,
        pricing_logic: pricingLogic,
        qr_code_url: qrDataUrl,
      };

      const { error: batchError } = await supabase.from('produce_batches').insert([newBatch]);
      if (batchError) throw batchError;

      const hash = await generateBlockchainHash(newBatch);
      const { error: logError } = await supabase.from('supply_chain_logs').insert([{
        batch_id: batchId,
        status: 'Harvested',
        location: 'Source Farm',
        blockchain_hash: hash,
        updated_by: profile.id,
      }]);
      if (logError) throw logError;

      setFormData({
        crop: '',
        farmer_price: '',
        retail_price: '',
      });
      setIsAdding(false);
      setCreatedBatchId(batchId);
      fetchBatches();
    } catch (err: any) {
      setError(err.message || 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-border pb-12">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">OPERATIONS.</h1>
          <div className="flex items-center gap-4">
            <div className="etched-metal">Node Auth: Producer_{profile?.id.substring(0,6)}</div>
            <span className="mono-data text-primary">Status: Initial Seal Ready</span>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => { setIsAdding(!isAdding); if (!isAdding) { setCreatedBatchId(null); setError(null); } }}
            className="bronze-btn"
          >
            {isAdding ? 'Abort Log' : 'Seal New Batch'}
          </button>
          <button 
            onClick={() => setIsBlockchainAdding(!isBlockchainAdding)}
            className="px-6 py-3 bg-primary/20 border border-primary/50 text-primary rounded-md hover:bg-primary/30 transition-colors"
          >
            {isBlockchainAdding ? 'Cancel Blockchain Seal' : 'Blockchain Seal'}
          </button>
          {!walletConnected && (
            <button 
              onClick={handleConnectWallet}
              className="px-6 py-3 bg-slate-700 border border-slate-600 text-white rounded-md hover:bg-slate-600 transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
         <div className="tactile-card-slate p-10 space-y-4">
            <p className="mono-data text-text-muted">Total Active Batches</p>
            <p className="text-6xl font-bold text-white leading-none">{batches.length}</p>
         </div>
         <div className="tactile-card-olive p-10 space-y-4 border-primary/20 hover:bg-bg-olive transition-colors cursor-default">
            <p className="mono-data text-primary">Assured Base Margin</p>
            <div className="flex items-center gap-4">
               <p className="text-6xl font-bold text-white italic leading-none">18%</p>
               <IconShield className="w-10 h-10 text-primary opacity-30" />
            </div>
         </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="tactile-card-slate p-12 space-y-12 overflow-hidden border-primary/40 bg-[#121212]"
          >
            <h2 className="text-4xl font-bold tracking-tighter mix-blend-overlay">Cryptographic Harvest Seal</h2>
            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="etched-metal">Crop Designation</label>
                    <input 
                      required
                      value={formData.crop}
                      onChange={e => setFormData({...formData, crop: e.target.value})}
                      className="w-full bg-black/40 border border-border px-8 py-5 focus:border-primary outline-none text-white font-mono text-xl"
                      placeholder="e.g. Specialty Arabica"
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="etched-metal">Producer Price Lock ($)</label>
                    <input 
                      type="number"
                      step="0.01"
                      required
                      value={formData.farmer_price}
                      onChange={e => setFormData({...formData, farmer_price: e.target.value})}
                      className="w-full bg-black/40 border border-border px-8 py-5 focus:border-primary outline-none text-white font-mono text-xl"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="etched-metal">Retail Market Target ($)</label>
                    <input 
                      type="number"
                      step="0.01"
                      required
                      value={formData.retail_price}
                      onChange={e => setFormData({...formData, retail_price: e.target.value})}
                      className="w-full bg-black/40 border-2 border-primary/40 px-8 py-5 focus:border-primary outline-none text-white font-mono text-xl"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-border">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bronze-btn text-xl"
                >
                  {loading ? 'EX_PROC_SEAL...' : 'Execute Initial Protocol Seal'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBlockchainAdding && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="tactile-card-slate p-12 space-y-12 overflow-hidden border-primary/40 bg-[#121212]"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold tracking-tighter mix-blend-overlay">Blockchain Harvest Seal</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-400">Base Network Connected</span>
              </div>
            </div>
            
            {!walletConnected ? (
              <div className="text-center py-12">
                <p className="text-text-dim mb-6">Connect your wallet to create blockchain-verified batches</p>
                <button 
                  onClick={handleConnectWallet}
                  className="bronze-btn"
                >
                  Connect MetaMask
                </button>
              </div>
            ) : (
              <form onSubmit={handleBlockchainSubmit} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="etched-metal">Crop Designation</label>
                      <input 
                        required
                        value={blockchainFormData.crop}
                        onChange={e => setBlockchainFormData({...blockchainFormData, crop: e.target.value})}
                        className="w-full bg-black/40 border border-border px-8 py-5 focus:border-primary outline-none text-white font-mono text-xl"
                        placeholder="e.g. Specialty Arabica"
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="etched-metal">Base Price (ETH)</label>
                      <input 
                        type="number"
                        step="0.001"
                        required
                        value={blockchainFormData.basePrice}
                        onChange={e => setBlockchainFormData({...blockchainFormData, basePrice: e.target.value})}
                        className="w-full bg-black/40 border border-border px-8 py-5 focus:border-primary outline-none text-white font-mono text-xl"
                        placeholder="0.1"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="etched-metal">Total Payment (with 18% margin)</label>
                      <div className="w-full bg-black/60 border border-primary/50 px-8 py-5 text-primary font-mono text-xl">
                        {totalPayment} ETH
                      </div>
                      <p className="text-sm text-text-dim">Producer receives: {blockchainFormData.basePrice} + 18% margin</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-6 border-t border-border">
                  <button 
                    type="submit" 
                    disabled={blockchainLoading || !walletConnected}
                    className="bronze-btn text-xl"
                  >
                    {blockchainLoading ? 'SEALING_BLOCKCHAIN...' : 'Execute Blockchain Protocol Seal'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {createdBatchId && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="tactile-card-slate p-8 border-primary/40 bg-green-900/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-green-400">Batch Sealed Successfully!</h3>
              <p className="text-text-dim mt-2">Batch Identifier: <span className="font-mono text-white">{createdBatchId}</span></p>
            </div>
            <button 
              onClick={() => setCreatedBatchId(null)}
              className="text-text-dim hover:text-white"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="tactile-card-slate p-8 border-red-500/40 bg-red-900/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-red-400">Error Creating Batch</h3>
              <p className="text-text-dim mt-2">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-text-dim hover:text-white"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        <AnimatePresence>
          {batches.map((batch, i) => (
            <motion.div
              layout
              key={batch.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="tactile-card-slate group scale-100 hover:scale-[1.02] transition-transform"
            >
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <h3 className="font-bold text-4xl tracking-tighter text-white">{batch.crop_type}</h3>
                    <div className="mono-data text-text-muted opacity-60">
                      {formatDate(batch.created_at)}
                    </div>
                  </div>
                  <div className="p-5 bg-black/40 border border-white/5 text-primary shadow-inner">
                     <IconSprout className="w-12 h-12" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5 bg-black/10 -mx-10 px-10">
                  <div className="space-y-2">
                    <p className="mono-data text-text-muted text-[10px]">Margin Lock</p>
                    <p className="text-3xl font-bold text-white tracking-tighter">${batch.pricing_logic.farmer_price.toFixed(2)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="mono-data text-text-muted text-[10px]">Retail Target</p>
                    <p className="text-3xl font-bold text-primary italic tracking-tighter">${batch.pricing_logic.retail_price.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6">
                    <div className="flex items-center gap-6">
                        {batch.qr_code_url && (
                          <div className="p-1 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                            <img src={batch.qr_code_url} alt="QR" className="w-16 h-16 grayscale contrast-[1.5] brightness-75" />
                          </div>
                        )}
                        <div className="etched-metal text-primary/60 border-primary/20">SEQ: {batch.id}</div>
                    </div>
                    <div className="flex gap-4">
                      <a 
                        href={`/verify/${batch.id}`} 
                        target="_blank" 
                        className="p-4 bg-black/40 border border-white/5 text-text-dim hover:text-primary transition-all shadow-inner hover:border-primary/40 active:translate-y-1"
                      >
                        <IconSearch className="w-8 h-8" />
                      </a>
                    </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
