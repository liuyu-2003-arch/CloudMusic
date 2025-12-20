import React from 'react';
import { Clock, Mic2, Disc, Music, Search, Heart, Sparkles } from 'lucide-react';
import { LIBRARY_ITEMS } from '../constants';
import { View } from '../types';

interface SidebarProps {
  activeView: View;
  onChangeView: (view: View) => void;
  onDiscoverLightMusic?: () => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onChangeView, onDiscoverLightMusic, className = '' }) => {
  
  const renderIcon = (name: string) => {
    switch(name) {
      case 'Clock': return <Clock size={20} />;
      case 'Mic2': return <Mic2 size={20} />;
      case 'Disc': return <Disc size={20} />;
      case 'Music': return <Music size={20} />;
      case 'Heart': return <Heart size={20} />;
      default: return <Music size={20} />;
    }
  };

  const getTargetView = (id: string): View => {
      switch(id) {
          case 'recently_added': return View.RECENTLY_ADDED;
          case 'artists': return View.ARTISTS;
          case 'albums': return View.ALBUMS;
          case 'songs': return View.SONGS;
          case 'liked': return View.LIKED;
          default: return View.SONGS;
      }
  };

  const isItemActive = (id: string) => {
      return activeView === getTargetView(id);
  };

  return (
    <div className={`flex flex-col h-full bg-apple-sidebar border-r border-gray-200 pt-8 pb-4 px-4 ${className}`}>
      
      {/* Search Bar */}
      <div className="mb-6 relative">
        <span className="absolute left-3 top-2 text-gray-400">
           <Search size={16} />
        </span>
        <input 
          type="text" 
          placeholder="Search" 
          className="w-full bg-gray-100 text-sm py-2 pl-9 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-apple-accent/50"
        />
      </div>

      <div className="space-y-8 overflow-y-auto flex-1 no-scrollbar">
        <div>
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-3 px-3">Library</h3>
          <ul className="space-y-1">
            {LIBRARY_ITEMS.map((item) => (
              <li key={item.id}>
                <button 
                   onClick={() => onChangeView(getTargetView(item.id))}
                   className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${isItemActive(item.id) ? 'bg-gray-100 text-apple-accent' : 'text-apple-text hover:bg-apple-hover'}`}
                >
                  <span className={`${isItemActive(item.id) ? 'text-apple-accent' : 'text-apple-accent/70 group-hover:text-apple-accent'} transition-colors`}>
                    {renderIcon(item.icon)}
                  </span>
                  <span className="font-semibold text-[15px] tracking-tight">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-3 px-3">Recommended</h3>
          <button 
            onClick={onDiscoverLightMusic}
            className="w-[calc(100%-16px)] mx-2 p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-teal-500/10 border border-teal-500/5 hover:border-teal-500/20 transition-all group relative overflow-hidden active:scale-95"
          >
            <div className="relative z-10 flex flex-col items-start text-left">
              <Sparkles size={18} className="text-teal-600 mb-2 group-hover:rotate-12 transition-transform" />
              <span className="text-[14px] font-bold text-apple-text mb-1">Pure Silence Pack</span>
              <p className="text-[11px] text-gray-500 leading-tight">Add 100% quiet instrumental & nature tracks.</p>
            </div>
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-teal-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;