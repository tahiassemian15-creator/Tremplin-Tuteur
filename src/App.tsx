import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatBoard } from './components/ChatBoard';
import { Composer } from './components/Composer';
import { ImageModal } from './components/ImageModal';
import { QUICK_ACTIONS } from './data/quickActions';
import { Conversation, Message, AttachedImage, ConfigStatus } from './types';

const STORAGE_KEY = 'tremplin_conversations_v1';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [modalImageSrc, setModalImageSrc] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Check API Configuration status on load
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setConfigStatus(data))
      .catch((err) => {
        console.warn('Impossible de récupérer le statut de configuration API:', err);
      });
  }, []);

  // 2. Load conversations from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: Conversation[] = JSON.parse(raw);
        if (saved && saved.length > 0) {
          const sorted = saved.sort((a, b) => b.updatedAt - a.updatedAt);
          setConversations(sorted);
          setCurrentId(sorted[0].id);
          setMessages(sorted[0].messages || []);
          return;
        }
      }
    } catch (e) {
      console.warn('Erreur de lecture du stockage local:', e);
    }

    // Default first new conversation
    createNewConversation();
  }, []);

  // Helper to persist conversations
  const saveToStorage = (updatedList: Conversation[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Impossible de sauvegarder dans localStorage:', e);
    }
  };

  const createTitleFromMessages = (msgs: Message[]): string => {
    const firstUser = msgs.find((m) => m.role === 'user');
    if (!firstUser) return 'Nouvelle conversation';
    const text = firstUser.text.trim();
    if (!text || text === '(exercice joint)') return 'Exercice photo joint';
    return text.length > 36 ? text.slice(0, 36) + '…' : text;
  };

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      title: 'Nouvelle conversation',
      messages: [],
      updatedAt: Date.now(),
    };
    setConversations((prev) => {
      const nextList = [newConv, ...prev];
      saveToStorage(nextList);
      return nextList;
    });
    setCurrentId(newConv.id);
    setMessages([]);
    setAttachedImage(null);
    setInput('');
    setErrorMessage(null);
  };

  const switchConversation = (id: string) => {
    const target = conversations.find((c) => c.id === id);
    if (!target) return;
    setCurrentId(id);
    setMessages(target.messages || []);
    setAttachedImage(null);
    setErrorMessage(null);
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const wasCurrent = id === currentId;
    const remaining = conversations.filter((c) => c.id !== id);
    setConversations(remaining);
    saveToStorage(remaining);

    if (wasCurrent) {
      if (remaining.length > 0) {
        switchConversation(remaining[0].id);
      } else {
        createNewConversation();
      }
    }
  };

  const clearCurrentChat = () => {
    if (!currentId) return;
    setMessages([]);
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === currentId
          ? { ...c, messages: [], title: 'Nouvelle conversation', updatedAt: Date.now() }
          : c
      );
      saveToStorage(updated);
      return updated;
    });
    setAttachedImage(null);
    setErrorMessage(null);
  };

  // Main Send Function
  const handleSend = async (overridePrompt?: string) => {
    const textToSend = (overridePrompt !== undefined ? overridePrompt : input).trim();
    if (!textToSend && !attachedImage) return;
    if (isLoading) return;

    setErrorMessage(null);

    const userMessage: Message = {
      id: 'm_user_' + Date.now(),
      role: 'user',
      text: textToSend || '(exercice joint)',
      imagePreview: attachedImage ? attachedImage.preview : null,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    const currentAttachment = attachedImage;
    setAttachedImage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, text: m.text })),
          prompt: textToSend,
          attachedImage: currentAttachment
            ? {
                data: currentAttachment.data,
                mediaType: currentAttachment.mediaType,
              }
            : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Erreur serveur HTTP ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: 'm_ast_' + Date.now(),
        role: 'assistant',
        text: data.reply || 'Je n\'ai pas pu générer de réponse.',
        timestamp: Date.now(),
        provider: data.provider,
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      // Persist conversation update
      setConversations((prev) => {
        let found = false;
        const updated = prev.map((conv) => {
          if (conv.id === currentId) {
            found = true;
            return {
              ...conv,
              messages: finalMessages,
              title: createTitleFromMessages(finalMessages),
              updatedAt: Date.now(),
            };
          }
          return conv;
        });

        if (!found && currentId) {
          const newConv: Conversation = {
            id: currentId,
            title: createTitleFromMessages(finalMessages),
            messages: finalMessages,
            updatedAt: Date.now(),
          };
          const nextList = [newConv, ...prev];
          saveToStorage(nextList);
          return nextList;
        }

        saveToStorage(updated);
        return updated;
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('Erreur lors de la communication avec le tuteur:', errMsg);
      setErrorMessage(errMsg);

      const errorMessageObj: Message = {
        id: 'm_err_' + Date.now(),
        role: 'assistant',
        text: `⚠️ **Une erreur est survenue :**\n\n${errMsg}\n\n*Vérifie ta connexion internet ou la configuration de ta clé API, puis réessaie.*`,
        timestamp: Date.now(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentConv = conversations.find((c) => c.id === currentId);

  return (
    <div className="flex h-screen w-screen bg-[#05090f] text-[#e7ebf0] overflow-hidden" id="tremplin-app-root">
      {/* Mobile backdrop overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar navigation & history */}
      <Sidebar
        conversations={conversations}
        currentId={currentId}
        quickActions={QUICK_ACTIONS}
        configStatus={configStatus}
        onSelectConversation={switchConversation}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
        onClearCurrentChat={clearCurrentChat}
        onSelectQuickAction={(prompt) => handleSend(prompt)}
        hasMessagesInCurrentChat={messages.length > 0}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Chat Workspace */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0f1c2e] relative overflow-hidden">
        <Header
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
          onNewChat={createNewConversation}
          onClearChat={clearCurrentChat}
          hasMessages={messages.length > 0}
          activeConversationTitle={currentConv?.title}
          configStatus={configStatus}
        />

        {/* Chat message board */}
        <ChatBoard
          messages={messages}
          isLoading={isLoading}
          onSelectQuickAction={(prompt) => handleSend(prompt)}
          onOpenImageModal={(src) => setModalImageSrc(src)}
          quickActions={QUICK_ACTIONS}
        />

        {/* Input composer with drag & drop image support */}
        <Composer
          input={input}
          onChangeInput={setInput}
          onSend={() => handleSend()}
          attachedImage={attachedImage}
          onAttachImage={setAttachedImage}
          isLoading={isLoading}
          onSelectSuggestion={(promptText) => {
            setInput(promptText);
          }}
        />
      </main>

      {/* Full size image modal */}
      <ImageModal
        isOpen={modalImageSrc !== null}
        imageSrc={modalImageSrc}
        onClose={() => setModalImageSrc(null)}
      />
    </div>
  );
}
