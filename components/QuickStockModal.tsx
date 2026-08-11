'use client'

import React, { useState, useEffect } from 'react'
import { Placa } from '@/types'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { X, Save, Zap } from 'lucide-react'

interface QuickStockModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, newStock: number) => Promise<void>
  placaToEdit: Placa | null
}

export function QuickStockModal({ isOpen, onClose, onSave, placaToEdit }: QuickStockModalProps) {
  const [stock, setStock] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && placaToEdit) {
      setStock(placaToEdit.metros_cuadrados_sobrantes.toString())
      setError(null)
    }
  }, [isOpen, placaToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!placaToEdit) return
    
    setError(null)
    setIsLoading(true)
    try {
      await onSave(placaToEdit.id, Number(stock))
      onClose()
    } catch (err: any) {
      setError(err.message || 'Error al guardar el stock')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !placaToEdit) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 bg-zinc-900/60 backdrop-blur-sm sm:transition-opacity">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all translate-y-0 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/80">
          <div className="flex items-center gap-2 text-amber-600">
            <Zap size={20} className="fill-amber-500" />
            <h2 className="text-lg font-bold text-zinc-900">Actualizar Stock</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-zinc-400 hover:text-zinc-700 bg-zinc-100/50 hover:bg-zinc-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-sm font-medium text-zinc-500 mb-1">Material</p>
            <p className="text-lg font-bold text-zinc-900 leading-tight">{placaToEdit.nombre}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100">
              {error}
            </div>
          )}
          
          <form id="stock-form" onSubmit={handleSubmit}>
            <Input 
              label="Metros físicos disponibles (m²)" 
              name="stock"
              type="number" step="0.01" required 
              value={stock} 
              onChange={(e) => setStock(e.target.value)} 
              className="text-lg text-center font-bold"
              autoFocus
            />
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex flex-col gap-3">
          <Button 
            type="submit" 
            form="stock-form" 
            disabled={isLoading}
            className="w-full text-base py-3"
          >
            {isLoading ? 'Guardando...' : 'Confirmar Stock'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} className="w-full">
            Cancelar
          </Button>
        </div>

      </div>
    </div>
  )
}
