import React from 'react';
import { X, ZoomIn } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, imageSrc, onClose }) => {
  if (!isOpen || !imageSrc) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      id="image-preview-modal"
    >
      <div
        className="relative max-w-4xl max-h-[90vh] bg-[#0b1420] border border-[#e7ebf0]/20 rounded-2xl overflow-hidden shadow-2xl p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors z-10"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <img
          src={imageSrc}
          alt="Aperçu exercice plein écran"
          className="max-h-[82vh] w-auto object-contain rounded-lg mx-auto"
        />
      </div>
    </div>
  );
};
