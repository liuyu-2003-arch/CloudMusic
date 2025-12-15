import React from 'react';
import { PlayCircle, LayoutGrid, Radio, Clock, Mic2, Disc, Music, Search } from 'lucide-react';
import { NAV_ITEMS, LIBRARY_ITEMS } from '../constants';
import { View } from '../types';

interface SidebarProps {
  activeView: View;
  onChangeView: (view: View) => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onChangeView, className = '' }) => {
  
  const renderIcon = (name: string) => {
    switch(name) {
      case 'PlayCircle': return <PlayCircle size={20} />;
      case 'LayoutGrid': return <LayoutGrid size={20} />;
      case 'Radio': return <Radio size={20} />;
      case 'Clock': return <Clock size={20} />;
      case 'Mic2': return <Mic2 size={20} />;
      case 'Disc': return <Disc size={20} />;
      case 'Music': return <Music size={20} />;
      default: return <Music size={20} />;
    }
  };

  return (
    <div className={`flex flex-col h-full bg-apple-sidebar border-r border-gray-200 pt-8 pb-4 px-4 ${className}`}>
      
      {/* Search Bar - Aesthetic only for layout */}
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

      <div className="space-y-6 overflow-y-auto flex-1">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">Apple Music</h3>
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button 
                  onClick={() => onChangeView(View.HOME)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${activeView === View.HOME && item.id === 'home' ? 'bg-gray-100 text-apple-accent' : 'text-apple-text hover:bg-apple-hover'}`}
                >
                  <span className={activeView === View.HOME && item.id === 'home' ? 'text-apple-accent' : 'text-apple-accent'}>
                    {renderIcon(item.icon)}
                  </span>
                  <span className="font-medium text-[15px]">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">Library</h3>
          <ul className="space-y-1">
            {LIBRARY_ITEMS.map((item) => (
              <li key={item.id}>
                <button 
                   onClick={() => onChangeView(View.LIBRARY)}
                   className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${activeView === View.LIBRARY && item.id === 'songs' ? 'bg-gray-100 text-apple-accent' : 'text-apple-text hover:bg-apple-hover'}`}
                >
                  <span className="text-apple-accent">
                    {renderIcon(item.icon)}
                  </span>
                  <span className="font-medium text-[15px]">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;