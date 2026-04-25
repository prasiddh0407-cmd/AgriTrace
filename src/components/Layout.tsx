import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { 
  IconSprout, 
  IconSearch, 
  IconDashboard, 
  IconTruck, 
  IconLogOut 
} from '../icons';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { to: '/', icon: IconSprout, label: 'Home' },
    { to: '/verify', icon: IconSearch, label: 'Verify' },
    ...(profile ? [{ to: '/dashboard', icon: IconDashboard, label: 'Dashboard' }] : []),
    ...(profile?.role === 'logistics' ? [{ to: '/transit', icon: IconTruck, label: 'Transit' }] : []),
  ];

  return (
    <div className="flex h-screen bg-bg-dark text-text-main overflow-hidden font-serif">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-6 md:p-12">
          {children}
        </main>
      </div>
    </div>
  );
}
