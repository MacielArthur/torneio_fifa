import React from 'react';
import { Users, Trophy, Play, Settings, Shield } from 'lucide-react';
import { useTournamentStore } from '../store/useTournamentStore';

export const Header = () => {
  const { activeTab, setActiveTab, currentTournament } = useTournamentStore();

  const navItems = [
    { id: 'elenco', label: 'Elenco & Sorteio', icon: Users },
    { 
      id: 'torneio', 
      label: 'Campeonato Atual', 
      icon: Play,
      badge: currentTournament ? (currentTournament.format === 'liga' ? 'Liga 3' : 'Copa 4') : null,
    },
    { id: 'hall', label: 'Hall da Fama', icon: Trophy },
    { id: 'config', label: 'Backup & Config', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-[#1f293d]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('elenco')}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-eafc-neon to-emerald-600 flex items-center justify-center shadow-neon font-black text-black text-2xl tracking-tighter">
              FC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-eafc-neon font-bold">EA FC MANAGER</span>
                <span className="text-[10px] bg-emerald-950 text-eafc-neon border border-emerald-800/80 px-1.5 py-0.5 rounded font-mono">v1.0</span>
              </div>
              <h1 className="text-xl font-display font-bold tracking-tight text-white flex items-center gap-1.5">
                TORNEIO DOS CRIAS
              </h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-eafc-neon/15 to-transparent text-eafc-neon border border-eafc-neon/40 shadow-neon'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-eafc-neon' : 'text-slate-400'}`} />
                  <span className="hidden md:inline">{item.label}</span>
                  {item.badge && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-eafc-neon opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-eafc-neon"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

