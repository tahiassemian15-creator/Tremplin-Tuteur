import React from 'react';
import {
  Plus,
  Trash2,
  Sparkles,
  Brain,
  Calendar,
  HeartPulse,
  Lightbulb,
  CheckCircle2,
  Key,
  CheckCircle,
  MessageSquare,
  Flame,
} from 'lucide-react';
import { Conversation, QuickAction, ConfigStatus } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  currentId: string | null;
  quickActions: QuickAction[];
  configStatus: ConfigStatus | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  onClearCurrentChat: () => void;
  onSelectQuickAction: (prompt: string) => void;
  hasMessagesInCurrentChat: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-4 h-4 text-[#e7b73c]" />,
  Brain: <Brain className="w-4 h-4 text-[#e7b73c]" />,
  Calendar: <Calendar className="w-4 h-4 text-[#e7b73c]" />,
  HeartPulse: <HeartPulse className="w-4 h-4 text-[#e7b73c]" />,
  Lightbulb: <Lightbulb className="w-4 h-4 text-[#e7b73c]" />,
  CheckCircle2: <CheckCircle2 className="w-4 h-4 text-[#e7b73c]" />,
};

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  currentId,
  quickActions,
  configStatus,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onClearCurrentChat,
  onSelectQuickAction,
  hasMessagesInCurrentChat,
  isOpenMobile,
  onCloseMobile,
}) => {
  return (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-40
        w-[280px] bg-[#0b1420] border-r border-[#e7ebf0]/10
        flex flex-col p-4 gap-4 transition-transform duration-200 ease-in-out
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      id="tremplin-sidebar"
    >
      {/* Brand Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 shrink-0">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="1" y="1" width="30" height="30" rx="9" fill="#141A28" />
              <rect x="1" y="1" width="30" height="30" rx="9" stroke="#3A4258" strokeWidth="1" />
              <path d="M7.5 21.5H21" stroke="#B08A2E" strokeWidth="2.3" strokeLinecap="round" />
              <path d="M10.6 21.5v-3.6" stroke="#B08A2E" strokeWidth="2.3" strokeLinecap="round" />
              <path d="M21 21.3c.2-5.1 2.3-8.5 5-9.9" stroke="#B08A2E" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="0.5 3.6" />
              <circle cx="26.3" cy="10.6" r="2.2" fill="#D9B24E" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-white tracking-tight">Tremplin</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#e7b73c]/15 text-[#e7b73c] border border-[#e7b73c]/30 rounded">
                Tuteur
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-[#8996a8] leading-relaxed">
        Ton tuteur personnel : corrections d'exercices pas-à-pas et techniques d'étude pour ton concours.
      </p>

      {/* New Conversation Button */}
      <button
        id="new-chat-button"
        onClick={() => {
          onNewConversation();
          onCloseMobile();
        }}
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-[#e7ebf0]/15 hover:border-[#e7b73c] hover:bg-[#e7b73c]/10 text-[#e7ebf0] text-xs font-semibold transition-colors duration-150 cursor-pointer group"
      >
        <Plus className="w-4 h-4 text-[#e7b73c] group-hover:scale-110 transition-transform" />
        <span>Nouvelle conversation</span>
      </button>

      {/* API Connection Indicator */}
      <div className="px-2.5 py-2 rounded-lg bg-[#0f1c2e] border border-[#e7ebf0]/10 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <Key className="w-3.5 h-3.5 text-[#e7b73c]" />
          <span className="text-[#8996a8]">Moteur IA :</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-white font-medium">
            {configStatus?.activeProvider || 'Connecté'}
          </span>
        </div>
      </div>

      {/* Scrollable middle area: Quick actions & History */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
        {/* Quick Actions */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8996a8] mb-2 px-1 flex items-center gap-1">
            <Flame className="w-3 h-3 text-[#e7b73c]" />
            Démarrer avec
          </div>
          <div className="space-y-1.5">
            {quickActions.slice(0, 4).map((qa) => (
              <button
                key={qa.id}
                id={`qa-btn-${qa.id}`}
                onClick={() => {
                  onSelectQuickAction(qa.prompt);
                  onCloseMobile();
                }}
                className="w-full text-left p-2 rounded-lg border border-[#e7ebf0]/10 hover:border-[#e7b73c]/50 hover:bg-[#e7b73c]/10 transition-all flex items-start gap-2.5 cursor-pointer group"
              >
                <span className="mt-0.5 shrink-0 group-hover:scale-110 transition-transform">
                  {iconMap[qa.iconName] || <Sparkles className="w-4 h-4 text-[#e7b73c]" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#e7ebf0] group-hover:text-white truncate">
                    {qa.label}
                  </div>
                  <div className="text-[11px] text-[#8996a8] truncate">
                    {qa.hint}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation History */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8996a8] mb-2 px-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-[#8996a8]" />
              Historique ({conversations.length})
            </span>
          </div>

          {conversations.length === 0 ? (
            <div className="text-xs text-[#8996a8]/70 px-2 py-3 text-center border border-dashed border-[#e7ebf0]/5 rounded-lg">
              Aucune conversation enregistrée.
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => {
                const isActive = conv.id === currentId;
                return (
                  <div
                    key={conv.id}
                    id={`conv-item-${conv.id}`}
                    onClick={() => {
                      onSelectConversation(conv.id);
                      onCloseMobile();
                    }}
                    className={`
                      group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors
                      ${
                        isActive
                          ? 'bg-[#e7b73c]/15 text-white border border-[#e7b73c]/30 font-medium'
                          : 'text-[#8996a8] hover:bg-white/5 hover:text-[#e7ebf0]'
                      }
                    `}
                  >
                    <span className="truncate flex-1 pr-2">
                      {conv.title || 'Nouvelle conversation'}
                    </span>
                    <button
                      id={`delete-conv-${conv.id}`}
                      title="Supprimer la conversation"
                      onClick={(e) => onDeleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#8996a8] hover:text-rose-400 rounded transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="border-t border-[#e7ebf0]/10 pt-3 space-y-2 text-[11px] text-[#8996a8]">
        {hasMessagesInCurrentChat && (
          <button
            id="clear-chat-btn"
            onClick={onClearCurrentChat}
            className="flex items-center gap-1.5 text-[#8996a8] hover:text-rose-400 transition-colors w-full py-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Effacer la conversation</span>
          </button>
        )}
        <div className="flex items-center gap-1.5 text-[10px] text-[#8996a8]/80">
          <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>Toutes matières · Réponses en français</span>
        </div>
      </div>
    </aside>
  );
};
