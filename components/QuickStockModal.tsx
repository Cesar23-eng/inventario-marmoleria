'use client'

import React, { useState, useEffect } from 'react'
import { Placa } from '@/types'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { X, Minus, Zap, ArrowDown } from 'lucide-react'

interface QuickStockModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, newStock: number) => Promise<void>
  placaToEdit: Placa | null
}

export function QuickStockModal({ isOpen, onClose, onSave, placaToEdit }: QuickStockModalProps) {
  const [amountToSubtract, setAmountToSubtract] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && placaToEdit) {
      setAmountToSubtract('')
      setError(null)
    }
  }, [isOpen, placaToEdit])

  const currentStock = placaToEdit?.metros_cuadrados_sobrantes ?? 0
  const subtractValue = Number(amountToSubtract) || 0
  const newStock = Math.round((currentStock - subtractValue) * 100) / 100
  const isInvalid = subtractValue <= 0 || newStock < 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!placaToEdit) return
    if (isInvalid) {
      setError('La cantidad a descontar debe ser mayor a 0 y no puede superar el stock actual.')
      return
    }
    
    setError(null)
    setIsLoading(true)
    try {
      await onSave(placaToEdit.id, newStock)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el stock')
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
            <Minus size={20} className="text-amber-600" />
            <h2 className="text-lg font-bold text-zinc-900">Descontar Stock</h2>
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
          <div className="mb-5">
            <p className="text-sm font-medium text-zinc-500 mb-1">Material</p>
            <p className="text-lg font-bold text-zinc-900 leading-tight">{placaToEdit.nombre}</p>
            <p className="text-sm text-zinc-500">{placaToEdit.material}</p>
          </div>

          {/* Current Stock Display */}
          <div className="mb-5 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Stock Actual</p>
            <p className="text-2xl font-bold text-zinc-900">{currentStock} <span className="text-sm font-medium text-zinc-500">m²</span></p>
          </div>

          {error && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100">
              {error}
            </div>
          )}
          
          <form id="stock-form" onSubmit={handleSubmit}>
            <Input 
              label="Cantidad a descontar (m²)" 
              name="amount"
              type="number" step="0.01" min="0.01" required 
              value={amountToSubtract} 
              onChange={(e) => { setAmountToSubtract(e.target.value); setError(null) }} 
              className="text-lg text-center font-bold"
              placeholder="Ej. 2.50"
              autoFocus
            />
          </form>

          {/* Preview of new stock */}
          {subtractValue > 0 && (
            <div className={`mt-4 p-4 rounded-xl border ${newStock < 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <ArrowDown size={14} className={newStock < 0 ? 'text-red-500' : 'text-emerald-600'} />
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: newStock < 0 ? '#b91c1c' : '#047857' }}>
                  Stock Resultante
                </p>
              </div>
              <p className={`text-2xl font-bold ${newStock < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                {newStock} <span className="text-sm font-medium opacity-70">m²</span>
              </p>
              {newStock < 0 && (
                <p className="text-xs text-red-600 mt-1">No se puede descontar más del stock disponible.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex flex-col gap-3">
          <Button 
            type="submit" 
            form="stock-form" 
            disabled={isLoading || isInvalid}
            className="w-full text-base py-3"
          >
            {isLoading ? 'Guardando...' : `Descontar ${subtractValue > 0 ? subtractValue + ' m²' : ''}`}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} className="w-full">
            Cancelar
          </Button>
        </div>

      </div>
    </div>
  )
}

