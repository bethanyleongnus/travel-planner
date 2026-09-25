import React from 'react';
import {
  Compass,
  MapPin,
  Luggage,
  DollarSign,
  CloudSun,
  BookOpen,
  HelpCircle,
  FolderHeart,
  Terminal,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { ServerStatus } from '../types/travel.ts';

interface HeaderProps {
  activeTab: 'itinerary' | 'packing' | 'budget' | 'weather' | 'tours' | 'expert' | 'trips';
  setActiveTab: (tab: 'itinerary' | 'packing' | 'budget' | 'weather' | 'tours' | 'expert' | 'trips') => void;
  currentDestination?: string;
  serverStatus: ServerStatus | null;
  onOpenMcpInspector: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentDestination,
  serverStatus,
  onOpenMcpInspector
}) => {
  const tabs = [
    { id: 'itinerary' as const, label: 'Itinerary Planner', icon: Compass },
    { id: 'packing' as const, label: 'Packing List', icon: Luggage },
    { id: 'budget' as const, label: 'Cost Estimator', icon: DollarSign },
    { id: 'weather' as const, label: 'Weather & Climate', icon: CloudSun },
    { id: 'tours' as const, label: 'Guides & Tours', icon: BookOpen },
    { id: 'expert' as const, label: 'Travel Expert', icon: HelpCircle },
    { id: 'trips' as const, label: 'Saved Trips', icon: FolderHeart }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top brand & status bar */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Compass className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                  PlanTrip <span className="text-emerald-600 font-semibold text-sm">Studio</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  MCP Travel Agent
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                All-in-one travel coordinator powered by Model Context Protocol tools
              </p>
            </div>
          </div>

          {/* Active destination & MCP Console button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentDestination && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Active Destination:</span>
                <span className="font-semibold text-slate-900">{currentDestination}</span>
              </div>
            )}

            <button
              onClick={onOpenMcpInspector}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-100 hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
              title="Inspect Model Context Protocol server tools"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>MCP Tools (14)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
