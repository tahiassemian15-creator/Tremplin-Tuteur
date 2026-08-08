import React, { useRef, useEffect } from 'react';
import { Paperclip, Send, X, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { AttachedImage } from '../types';

interface ComposerProps {
  input: string;
  onChangeInput: (val: string) => void;
  onSend: (overrideText?: string) => void;
  attachedImage: AttachedImage | null;
  onAttachImage: (img: AttachedImage | null) => void;
  isLoading: boolean;
  onSelectSuggestion?: (text: string) => void;
}

export const Composer: React.FC<ComposerProps> = ({
  input,
  onChangeInput,
  onSend,
  attachedImage,
  onAttachImage,
  isLoading,
  onSelectSuggestion,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      onAttachImage({
        data: base64Data,
        mediaType: file.type,
        name: file.name,
        preview: result,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Allow paste image directly into textarea
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            onAttachImage({
              data: base64Data,
              mediaType: file.type,
              name: 'Capture d\'écran collée',
              preview: result,
            });
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && (input.trim() || attachedImage)) {
        onSend();
      }
    }
  };

  const canSend = !isLoading && (input.trim().length > 0 || attachedImage !== null);

  const quickPrompts = [
    'Corrige cet exercice étape par étape',
    'Explique la formule sous-jacente',
    'Donne-moi un exercice d\'application similaire',
  ];

  return (
    <div className="border-t border-[#e7ebf0]/10 bg-[#0b1420] p-3 sm:p-4 shrink-0" id="tremplin-composer">
      {/* Quick context pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none text-[11px]">
        <span className="text-[#8996a8] flex items-center gap-1 shrink-0 text-[10px] uppercase font-bold tracking-wider">
          <Sparkles className="w-3 h-3 text-[#e7b73c]" />
          Suggestions :
        </span>
        {quickPrompts.map((promptText, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectSuggestion && onSelectSuggestion(promptText)}
            className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#e7b73c]/15 hover:text-[#e7b73c] border border-white/5 text-[#c0cddb] whitespace-nowrap transition-colors shrink-0 cursor-pointer"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Image attachment preview */}
      {attachedImage && (
        <div className="mb-2.5 inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-[#e7b73c]/30 text-xs text-[#e7ebf0]">
          <div className="relative w-8 h-8 rounded overflow-hidden bg-black/40 border border-white/10 shrink-0">
            <img
              src={attachedImage.preview}
              alt="Aperçu exercice"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="max-w-[200px] truncate text-[11px]">
            <span className="font-medium text-[#e7b73c]">Photo jointe :</span> {attachedImage.name}
          </div>
          <button
            id="remove-attachment-btn"
            type="button"
            onClick={() => onAttachImage(null)}
            className="p-1 rounded-md text-[#8996a8] hover:text-rose-400 hover:bg-white/10 transition-colors ml-1"
            title="Retirer la photo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-end gap-2 bg-[#0f1c2e] border border-[#e7ebf0]/15 rounded-xl p-1.5 focus-within:border-[#e7b73c] focus-within:ring-1 focus-within:ring-[#e7b73c]/40 transition-all">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          id="exercise-file-input"
        />

        {/* Attach Button */}
        <button
          id="attach-image-btn"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Joindre une photo d'exercice (ou énoncé)"
          className={`
            p-2 rounded-lg text-[#8996a8] hover:text-[#e7b73c] hover:bg-white/5 transition-colors cursor-pointer shrink-0
            ${attachedImage ? 'text-[#e7b73c] bg-[#e7b73c]/10' : ''}
          `}
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          id="message-input"
          value={input}
          onChange={(e) => onChangeInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Écris ta question, colle ton énoncé ou joins une photo..."
          rows={1}
          disabled={isLoading}
          className="flex-1 bg-transparent text-[#e7ebf0] text-sm placeholder-[#8996a8] resize-none outline-none py-1.5 px-1 max-h-[140px] leading-relaxed font-sans"
        />

        {/* Send Button */}
        <button
          id="send-message-btn"
          type="button"
          disabled={!canSend}
          onClick={() => onSend()}
          className={`
            p-2 rounded-lg transition-all flex items-center justify-center shrink-0 cursor-pointer
            ${
              canSend
                ? 'bg-[#e7b73c] text-[#1b2430] hover:brightness-110 shadow-sm'
                : 'bg-white/5 text-[#8996a8]/40 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#1b2430]" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
      <div className="flex items-center justify-between text-[10px] text-[#8996a8] mt-1.5 px-1">
        <span>Appuie sur Entrée pour envoyer, Maj + Entrée pour un saut de ligne</span>
        <span>Analyse photo & texte</span>
      </div>
    </div>
  );
};
