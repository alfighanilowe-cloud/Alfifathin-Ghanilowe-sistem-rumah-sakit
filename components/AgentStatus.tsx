import React from 'react';
import { AgentType } from '../types';
import { AGENTS } from '../constants';
import * as Icons from 'lucide-react';

interface AgentStatusProps {
  activeAgent: AgentType | null;
  processing: boolean;
}

const AgentStatus: React.FC<AgentStatusProps> = ({ activeAgent, processing }) => {
  const IconComponent = (name: string) => {
    const Icon = (Icons as any)[name];
    return Icon ? <Icon size={20} /> : null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">System Activity</h3>
      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {(Object.keys(AGENTS) as AgentType[]).filter(k => k !== AgentType.SYSTEM).map((key) => {
          const agent = AGENTS[key];
          const isActive = activeAgent === key;
          const isProcessing = isActive && processing;

          return (
            <div 
              key={key}
              className={`
                relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-300
                ${isActive ? `border-${agent.color.replace('bg-', '')} bg-gray-50` : 'border-gray-100 opacity-60 grayscale'}
              `}
            >
              {isProcessing && (
                 <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${agent.color}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${agent.color}`}></span>
                </span>
              )}

              <div className={`p-2 rounded-full text-white mb-2 ${agent.color}`}>
                {IconComponent(agent.icon)}
              </div>
              <span className="text-[10px] font-bold text-center text-gray-700 leading-tight">
                {agent.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentStatus;