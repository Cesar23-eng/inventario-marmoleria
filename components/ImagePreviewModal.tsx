import React from 'react'
import { X } from 'lucide-react'

interface ImagePreviewModalProps {
  imageUrl: string | null
  altText: string
  isOpen: boolean
  onClose: () => void
}

export function ImagePreviewModal({ imageUrl, altText, isOpen, onClose }: ImagePreviewModalProps) {
  if (!isOpen || !imageUrl) return null

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
      >
        <X size={24} />
      </button>
      
      <div 
        className="relative max-w-5xl max-h-[90vh] w-full rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={imageUrl} 
          alt={altText} 
          className="w-full h-full object-contain max-h-[90vh]" 
        />
      </div>
    </div>
  )
}
