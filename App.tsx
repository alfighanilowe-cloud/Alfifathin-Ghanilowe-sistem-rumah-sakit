import React, { useState, useEffect } from 'react';
import ChatArea from './components/ChatArea';
import AgentStatus from './components/AgentStatus';
import { routeUserRequest, processAgentResponse } from './services/gemini';
import { ChatMessage, AgentType, RouterOutput } from './types';
import { SCENARIOS } from './constants';
import { ShieldCheck, Activity, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      agent: AgentType.ROUTER,
      content: "Selamat datang di SIMRS AI Agent System. Saya adalah Central Hub. Apa yang bisa saya bantu hari ini? (Pendaftaran, Rekam Medis, Billing, atau Janji Temu)",
      timestamp: new Date()
    }
  ]);
  const [activeAgent, setActiveAgent] = useState<AgentType | null>(AgentType.ROUTER);
  const [processing, setProcessing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-scroll logic happens in ChatArea, but we manage data here

  const handleSendMessage = async (text: string) => {
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMsg]);
    setProcessing(true);
    setActiveAgent(AgentType.ROUTER);

    try {
      // 1. Router Step
      const routerOutput: RouterOutput = await routeUserRequest(text);
      
      // Visual feedback of routing
      setActiveAgent(routerOutput.route);
      
      // Add a small system log to chat (optional, creates transparency)
      const systemLog: ChatMessage = {
        id: 'sys-' + Date.now(),
        role: 'system',
        content: `Routing to ${routerOutput.route}...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemLog]);

      // 2. Processing Step
      // Prepare history for context
      const historyContext = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));
      // Add current user msg to history context
      historyContext.push({ role: 'user', parts: [{ text: text }]});

      const responseText = await processAgentResponse(
        routerOutput.route, 
        text, 
        routerOutput.parameters,
        historyContext
      );

      const newAgentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        agent: routerOutput.route,
        content: responseText,
        timestamp: new Date(),
        metadata: { reasoning: routerOutput.reasoning }
      };

      setMessages(prev => [...prev, newAgentMsg]);

    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'model',
        agent: AgentType.SYSTEM,
        content: "Maaf, terjadi kesalahan sistem. Mohon coba lagi.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setProcessing(false);
      // Reset active agent to Router (idle state) after delay
      setTimeout(() => setActiveAgent(AgentType.ROUTER), 2000);
    }
  };

  const loadScenario = (prompt: string) => {
    setSidebarOpen(false);
    handleSendMessage(prompt);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="absolute inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        absolute md:relative z-30 w-72 h-full bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-200">
           <div className="flex items-center gap-2 text-blue-800 font-bold text-xl">
             <Activity />
             <span>SIMRS.AI</span>
           </div>
           <p className="text-xs text-gray-500 mt-1">Sistem Manajemen RS Terintegrasi</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Scenarios</h3>
            <div className="space-y-2">
              {SCENARIOS.map((scenario, idx) => (
                <button
                  key={idx}
                  onClick={() => loadScenario(scenario.prompt)}
                  disabled={processing}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all group"
                >
                  <div className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{scenario.title}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{scenario.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
             <div className="flex items-center gap-2 text-blue-700 mb-2">
               <ShieldCheck size={16} />
               <span className="text-xs font-bold">Security Compliance</span>
             </div>
             <p className="text-[10px] text-blue-600 leading-relaxed">
               Sistem ini mensimulasikan kepatuhan terhadap <strong>UU PDP</strong> dan integrasi <strong>Satu Sehat</strong>. Data pasien dienkripsi pada modul EMR.
             </p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
           <button 
             onClick={() => setMessages([messages[0]])}
             className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors"
           >
             Reset Simulation
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 flex items-center justify-between border-b border-gray-200">
           <div className="flex items-center gap-2 font-bold text-gray-800">
             <Activity size={20} className="text-blue-600" />
             <span>SIMRS.AI</span>
           </div>
           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-600">
             {sidebarOpen ? <X /> : <Menu />}
           </button>
        </div>

        <div className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full flex flex-col h-full">
           <AgentStatus activeAgent={activeAgent} processing={processing} />
           <div className="flex-1 min-h-0">
              <ChatArea 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                processing={processing}
              />
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;