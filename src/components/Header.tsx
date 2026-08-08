import React from 'react';
import { Menu, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { ConfigStatus } from '../types';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onNewChat: () => void;
  onClearChat: () => void;
  hasMessages: boolean;
  activeConversationTitle?: string;
  configStatus: ConfigStatus | null;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onNewChat,
  onClearChat,
  hasMessages,
  activeConversationTitle,
  configStatus,
}) => {
  return (
    <header className="h-14 border-b border-[#e7ebf0]/10 bg-[#0b1420]/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <button
          id="mobile-menu-btn"
          type="button"
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-lg text-[#8996a8] hover:text-white hover:bg-white/5 transition-colors"
          title="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-white max-w-[200px] sm:max-w-[320px] truncate">
            {activeConversationTitle || 'Nouvelle conversation'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {hasMessages && (
          <button
            id="header-clear-btn"
            onClick={onClearChat}
            className="p-2 rounded-lg text-[#8996a8] hover:text-rose-400 hover:bg-white/5 transition-colors text-xs flex items-center gap-1.5"
            title="Effacer la conversation en cours"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Effacer</span>
          </button>
        )}

        <button
          id="header-new-chat-btn"
          onClick={onNewChat}
          className="px-3 py-1.5 rounded-lg bg-[#e7b73c]/15 text-[#e7b73c] border border-[#e7b73c]/30 hover:bg-[#e7b73c]/25 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Nouveau</span>
        </button>
      </div>
    </header>
  );
};
