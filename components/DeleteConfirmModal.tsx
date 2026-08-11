import React from 'react'
import { Button } from './ui/Button'
import { AlertTriangle, X } from 'lucide-react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  isMultiple: boolean
  count: number
  isDeleting: boolean
}

export function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isMultiple, 
  count,
  isDeleting
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  const title = isMultiple 
    ? 'Eliminar materiales seleccionados'
    : 'Eliminar material'
    
  const message = isMultiple
    ? `¿Estás seguro? Esta acción eliminará permanentemente los ${count} materiales seleccionados de la base de datos y no se puede deshacer.`
    : `¿Estás seguro? Esta acción eliminará permanentemente este material de la base de datos y no se puede deshacer.`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-red-100 bg-red-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={20} className="fill-red-100" />
            <h2 className="text-lg font-bold">{title}</h2>
          </div>
          <button 
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 bg-white hover:bg-zinc-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-zinc-600 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3 bg-zinc-50/50">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
          </Button>
        </div>

      </div>
    </div>
  )
}
