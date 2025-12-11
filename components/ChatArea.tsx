import React, { useRef, useEffect } from 'react';
import { ChatMessage, AgentType } from '../types';
import { AGENTS } from '../constants';
import { Send, User, Cpu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  processing: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, onSendMessage, processing }) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !processing) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
             <Cpu className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">SIMRS Live Agent</h2>
            <p className="text-xs text-gray-500">Integrated Hospital System v1.0</p>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const agent = msg.agent ? AGENTS[msg.agent] : null;

          if (msg.role === 'system') {
             return (
               <div key={msg.id} className="flex justify-center my-4">
                 <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
                   {msg.content}
                 </span>
               </div>
             )
          }

          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'} space-x-3`}>
                
                {/* Avatar */}
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${isUser ? 'bg-gray-700' : (agent?.color || 'bg-blue-600')}`}>
                   {isUser ? <User className="text-white" size={20} /> : <Cpu className="text-white" size={20} />}
                </div>

                {/* Bubble */}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  {!isUser && agent && (
                    <span className="text-xs font-bold text-gray-500 mb-1 ml-1">{agent.name}</span>
                  )}
                  <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                    isUser 
                      ? 'bg-gray-800 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}>
                    {isUser ? (
                       msg.content
                    ) : (
                       <div className="prose prose-sm max-w-none">
                         <ReactMarkdown>{msg.content}</ReactMarkdown>
                       </div>
                    )}
                  </div>
                  
                  {/* Metadata / Router Reasoning */}
                  {msg.metadata?.reasoning && !isUser && (
                     <div className="mt-1 ml-2 text-[10px] text-gray-400 italic">
                        Routed by Central Hub: {msg.metadata.reasoning}
                     </div>
                  )}
                  
                  <span className="text-[10px] text-gray-400 mt-1 mx-2">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={processing}
            placeholder={processing ? "Agents are thinking..." : "Ketik pesan Anda di sini (Contoh: Saya mau daftar dokter gigi)"}
            className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 text-sm"
          />
          <button
            type="submit"
            disabled={processing || !input.trim()}
            className={`p-3 rounded-xl flex items-center justify-center transition-all ${
              processing || !input.trim() 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white shadow-md hover:bg-blue-700 active:scale-95'
            }`}
          >
            <Send size={20} />
          </button>
        </form>
        {!process.env.API_KEY && (
           <p className="text-[10px] text-red-400 mt-2 text-center">
             Note: No API_KEY detected. Using simulation mock mode.
           </p>
        )}
      </div>
    </div>
  );
};

export default ChatArea;