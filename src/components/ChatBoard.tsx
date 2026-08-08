import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Calculator,
  Compass,
  GraduationCap,
  Maximize2,
} from 'lucide-react';
import { Message, QuickAction } from '../types';

interface ChatBoardProps {
  messages: Message[];
  isLoading: boolean;
  onSelectQuickAction: (prompt: string) => void;
  onRetryLastMessage?: () => void;
  onOpenImageModal: (src: string) => void;
  quickActions: QuickAction[];
}

export const ChatBoard: React.FC<ChatBoardProps> = ({
  messages,
  isLoading,
  onSelectQuickAction,
  onRetryLastMessage,
  onOpenImageModal,
  quickActions,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Auto scroll to bottom on new messages or loading state
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const subjectBadges = [
    { label: 'Mathématiques & Algèbre', icon: <Calculator className="w-3.5 h-3.5" /> },
    { label: 'Physique & Chimie', icon: <Compass className="w-3.5 h-3.5" /> },
    { label: 'Français & Dissertation', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { label: 'Culture Générale & Droit', icon: <GraduationCap className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6" id="tremplin-chatboard">
      {messages.length === 0 ? (
        <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center max-w-xl mx-auto py-8">
          <div className="w-14 h-14 mb-4 shadow-lg rounded-2xl overflow-hidden">
            <svg
              width="56"
              height="56"
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

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Pose ta première question
          </h2>
          <p className="text-sm text-[#8996a8] max-w-md leading-relaxed mb-6">
            Colle un exercice, joins une photo de ton énoncé ou demande une méthode de révision. Le tuteur Tremplin t'accompagne pas-à-pas.
          </p>

          {/* Subject pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {subjectBadges.map((subj, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-[#c0cddb]"
              >
                {subj.icon}
                {subj.label}
              </span>
            ))}
          </div>

          {/* Starter action cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
            {quickActions.map((qa) => (
              <button
                key={qa.id}
                onClick={() => onSelectQuickAction(qa.prompt)}
                className="p-3.5 rounded-xl bg-[#0b1420] border border-[#e7ebf0]/10 hover:border-[#e7b73c]/50 hover:bg-[#e7b73c]/5 transition-all text-left group cursor-pointer"
              >
                <div className="text-xs font-semibold text-white group-hover:text-[#e7b73c] transition-colors mb-1">
                  {qa.label}
                </div>
                <div className="text-[11px] text-[#8996a8] leading-normal line-clamp-2">
                  {qa.hint}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                id={`message-row-${m.id}`}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 shrink-0 mt-1 shadow-sm rounded-lg overflow-hidden">
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
                )}

                <div
                  className={`
                    relative group max-w-[88%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5
                    ${
                      isUser
                        ? 'bg-[#f5f6f8] text-[#1b2430] rounded-br-sm shadow-md'
                        : 'bg-[#0b1420] border border-[#e7ebf0]/10 text-[#e7ebf0] rounded-tl-sm'
                    }
                  `}
                >
                  {/* Attached photo in message */}
                  {m.imagePreview && (
                    <div className="relative mb-3 rounded-lg overflow-hidden border border-black/10 group/img inline-block max-w-full">
                      <img
                        src={m.imagePreview}
                        alt="Exercice joint"
                        className="max-h-64 rounded-lg object-contain bg-black/20"
                      />
                      <button
                        type="button"
                        onClick={() => onOpenImageModal(m.imagePreview!)}
                        className="absolute bottom-2 right-2 p-1.5 rounded bg-black/70 text-white opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-black"
                        title="Agrandir l'image"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Message body */}
                  {isUser ? (
                    <div className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                      {m.text}
                    </div>
                  ) : (
                    <div>
                      <div className="prose-tremplin">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.text}
                        </ReactMarkdown>
                      </div>

                      {/* Action toolbar for assistant response */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#e7ebf0]/10 text-xs text-[#8996a8]">
                        <button
                          type="button"
                          id={`copy-btn-${m.id}`}
                          onClick={() => handleCopy(m.id, m.text)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                          title="Copier la réponse"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copié !</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copier</span>
                            </>
                          )}
                        </button>

                        <span className="text-white/20">·</span>
                        <span className="text-[10px] text-[#8996a8]/70">
                          {m.provider ? `Généré via ${m.provider}` : 'Tremplin IA'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start items-start">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#16283f] to-[#0d1826] border border-[#e7b73c]/35 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <Sparkles className="w-4 h-4 text-[#e7b73c] animate-pulse" />
              </div>
              <div className="bg-[#0b1420] border border-[#e7ebf0]/10 rounded-2xl rounded-tl-sm p-4 text-[#8996a8] flex items-center gap-2">
                <span className="text-xs">Le tuteur Tremplin analyse et rédige la correction...</span>
                <div className="flex items-center gap-1 ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e7b73c] animate-bounce [animation-delay:0ms]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e7b73c] animate-bounce [animation-delay:150ms]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e7b73c] animate-bounce [animation-delay:300ms]"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};
