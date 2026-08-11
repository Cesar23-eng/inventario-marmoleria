import React, { useState, useEffect } from 'react'
import { Herramienta } from '@/types'
import { Button } from './ui/Button'
import { X, Minus, Plus, Package } from 'lucide-react'

interface QuickToolStockModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, newStock: number) => Promise<void>
  toolToEdit: Herramienta | null
}

export function QuickToolStockModal({ isOpen, onClose, onSave, toolToEdit }: QuickToolStockModalProps) {
  const [stock, setStock] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (toolToEdit) {
      setStock(toolToEdit.cantidad_disponible)
    }
  }, [toolToEdit, isOpen])

  if (!isOpen || !toolToEdit) return null

  const handleAdjust = (amount: number) => {
    setStock(prev => Math.max(0, prev + amount))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(toolToEdit.id, stock)
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-in slide-in-from-bottom-10 sm:zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 leading-tight">Stock Rápido</h2>
            <p className="text-sm text-zinc-500 truncate max-w-[200px]">{toolToEdit.nombre}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 bg-white shadow-sm hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-col items-center gap-6">
            
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleAdjust(-1)}
                className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 active:scale-95 transition-all"
              >
                <Minus size={24} />
              </button>
              
              <div className="text-center w-24">
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Math.max(0, Number(e.target.value)))}
                  className="w-full text-center text-4xl font-bold text-zinc-900 outline-none font-mono bg-transparent"
                />
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mt-1 block">
                  Unidades
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleAdjust(1)}
                className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 active:scale-95 transition-all"
              >
                <Plus size={24} strokeWidth={3} />
              </button>
            </div>

            <div className="flex gap-2 w-full mt-2">
              <button type="button" onClick={() => handleAdjust(5)} className="flex-1 py-2 rounded-xl bg-zinc-100 text-zinc-700 font-semibold hover:bg-zinc-200 transition-colors">+5</button>
              <button type="button" onClick={() => handleAdjust(10)} className="flex-1 py-2 rounded-xl bg-zinc-100 text-zinc-700 font-semibold hover:bg-zinc-200 transition-colors">+10</button>
            </div>
            
          </div>

          <Button 
            type="submit" 
            variant="primary"
            className="w-full mt-8 py-4 text-base rounded-2xl shadow-lg shadow-zinc-900/10"
            disabled={isSubmitting}
            icon={<Package size={20} />}
          >
            {isSubmitting ? 'Actualizando...' : 'Confirmar Stock'}
          </Button>
        </form>
      </div>
    </div>
  )
}
