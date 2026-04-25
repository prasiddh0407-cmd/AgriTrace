import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../lib/supabase';
import { cn } from '../lib/utils';
import { 
  IconSprout, 
  IconTruck, 
  IconArrowRight, 
  IconWallet 
} from '../icons';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<Role | null>(null);

  const handleSignIn = async (role: Role) => {
    setLoading(role);
    try {
      await signIn(role);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      setLoading(null);
    }
  };

  const roles: { id: Role; title: string; desc: string; icon: any }[] = [
    { id: 'producer', title: 'Producer', desc: 'Securely log harvest data and lock base margins', icon: IconSprout },
    { id: 'logistics', title: 'Logistics', desc: 'Verify transit logs and secure handoffs', icon: IconTruck },
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 md:py-32 space-y-24">
      <div className="text-center space-y-6">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mix-blend-overlay">Identify.</h1>
        <p className="text-text-dim text-xl font-mono uppercase tracking-[0.3em] opacity-60 italic">Select operational identity to bridge into grid</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 px-4">
        {roles.map((role, i) => (
          <motion.button
            key={role.id}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => handleSignIn(role.id)}
            disabled={loading !== null}
            className={cn(
              "p-10 text-left flex items-start gap-10 transition-all group relative overflow-hidden tactile-card-slate",
              loading === role.id && "border-primary"
            )}
          >
            <div className="p-6 bg-black/40 border border-white/5 text-primary group-hover:bg-primary group-hover:text-black transition-all shadow-inner relative">
              <role.icon className="w-12 h-12 group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary/20" />
            </div>
            <div className="flex-1 space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-3xl tracking-tighter">{role.title}</h3>
                <IconArrowRight className="w-8 h-8 text-text-muted group-hover:text-primary group-hover:translate-x-4 transition-all" />
              </div>
              <p className="text-text-dim text-lg leading-relaxed font-mono opacity-50 italic">{role.desc}</p>
            </div>
            
            {loading === role.id && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-md">
                <div className="flex gap-4">
                   <div className="w-3 h-3 bg-primary animate-pulse" />
                   <div className="w-3 h-3 bg-primary animate-pulse [animation-delay:0.2s]" />
                   <div className="w-3 h-3 bg-primary animate-pulse [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="p-12 tactile-card-olive flex flex-col md:flex-row items-center gap-12 relative overflow-visible">
        <div className="absolute -top-6 -left-6 etched-metal bg-primary text-black border-black/20">Security Layer Active</div>
        <div className="p-8 bg-black/40 border border-white/5 text-primary shadow-inner">
          <IconWallet className="w-12 h-12" />
        </div>
        <div className="flex-1 text-center md:text-left space-y-4">
          <h4 className="font-bold text-3xl tracking-tighter">Cryptographic Signature</h4>
          <p className="text-text-dim leading-relaxed max-w-2xl font-mono text-sm opacity-60">
            Every session is unique. Your actions are cryptographically signed and bridged to the Supabase-Ethereum integration layer for total traceability. Node sync latency: ~140ms.
          </p>
        </div>
        <div className="etched-metal">
          SECURE_SESSION_v2
        </div>
      </div>
    </div>
  );
}
