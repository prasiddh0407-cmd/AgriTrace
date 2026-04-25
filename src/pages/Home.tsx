import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  IconSprout, 
  IconShield, 
  IconArrowRight 
} from '../icons';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-32 space-y-32">
      <section className="text-center space-y-12 max-w-5xl mx-auto px-4 relative">
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="inline-flex items-center gap-3 px-6 py-2 bg-slate-900 border border-border text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-6 shadow-inner"
        >
          <IconShield className="w-4 h-4" />
          Protocol Verified Node
        </motion.div>
        
        <motion.h1 
          className="text-7xl md:text-[10rem] font-bold tracking-tighter text-white leading-none mix-blend-difference"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          SECURE <br />
          <span className="text-primary translate-x-12 inline-block">SOURCE.</span>
        </motion.h1>
        
        <motion.p 
          className="max-w-2xl mx-auto text-xl md:text-2xl text-text-dim leading-relaxed font-mono opacity-80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          ELIMINATING SHADOW MARGINS VIA DECENTRALIZED PROVENANCE LOGS. EVERY HARVEST SEALED CRYPTOGRAPHICALLY.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-12 justify-center pt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link 
            to="/login" 
            className="bronze-btn text-lg"
          >
            Access Network
          </Link>
          <Link 
            to="/verify" 
            className="px-10 py-4 bg-transparent hover:bg-slate-900 text-white border-2 border-border font-bold text-lg transition-all active:translate-y-1 active:translate-x-1"
          >
            Inspect Batch
          </Link>
        </motion.div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-20 gap-x-12 w-full px-4 max-w-7xl mx-auto">
        {[
          {
            title: "Producer Sovereignty",
            desc: "Protected 18% base margins locked via immutable pricing logic during the first harvest log.",
            icon: IconSprout,
            cardClass: "tactile-card-olive md:translate-y-12"
          },
          {
            title: "Operational Trust",
            desc: "Logistics partners sign every transit event, creating an unshakeable trust chain.",
            icon: IconShield,
            cardClass: "tactile-card-slate"
          },
          {
            title: "Trace Proof",
            desc: "Scan and witness the origin hash. No more fake organic labels or hidden network markups.",
            icon: IconArrowRight,
            cardClass: "tactile-card-olive lg:-translate-y-8"
          }
        ].map((feat, i) => (
          <motion.div
            key={feat.title}
            className={`${feat.cardClass} p-12 space-y-8 group transition-all cursor-default scale-100 hover:scale-[1.02]`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 + (i * 0.1) }}
          >
            <div className="w-16 h-16 bg-black/40 border border-white/10 flex items-center justify-center text-primary transition-transform shadow-inner">
              <feat.icon className="w-10 h-10" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-bold tracking-tighter">{feat.title}</h3>
              <p className="text-text-dim leading-relaxed text-lg font-mono opacity-60 italic">{feat.desc}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
