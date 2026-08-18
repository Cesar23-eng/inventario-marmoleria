'use client'

import React, { useState, useEffect } from 'react'
import { Placa, MedidaIndividual, calcularM2Total } from '@/types'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { X, Minus, Plus, ArrowDown, Check } from 'lucide-react'

interface QuickStockModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, newStock: number, medidas?: MedidaIndividual[] | null) => Promise<void>
  placaToEdit: Placa | null
}

export function QuickStockModal({ isOpen, onClose, onSave, placaToEdit }: QuickStockModalProps) {
  const [amount, setAmount] = useState<string>('')
  const [mode, setMode] = useState<'subtract' | 'add'>('subtract')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // For individual medidas: which plates to remove
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  // For individual medidas: new plate dimensions when adding
  const [newPlacaLargo, setNewPlacaLargo] = useState<string>('')
  const [newPlacaAncho, setNewPlacaAncho] = useState<string>('')

  const hasIndividualMedidas = !!(placaToEdit?.medidas_individuales && placaToEdit.medidas_individuales.length > 0)

  useEffect(() => {
    if (isOpen && placaToEdit) {
      setAmount('')
      setMode('subtract')
      setError(null)
      setSelectedIndices([])
      setNewPlacaLargo('')
      setNewPlacaAncho('')
    }
  }, [isOpen, placaToEdit])

  const currentStock = placaToEdit?.cantidad_placas ?? 0
  const amountValue = hasIndividualMedidas 
    ? (mode === 'subtract' ? selectedIndices.length : (Number(amount) || 0))
    : (Math.floor(Number(amount)) || 0)
  const newStock = mode === 'subtract' ? currentStock - amountValue : currentStock + amountValue
  const isInvalid = amountValue <= 0 || newStock < 0

  // Calculate m² for display
  const m2Current = placaToEdit ? calcularM2Total(placaToEdit) : 0

  const togglePlateSelection = (index: number) => {
    setSelectedIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!placaToEdit) return
    if (isInvalid) {
      setError('La cantidad debe ser mayor a 0 y el stock resultante no puede ser negativo.')
      return
    }
    
    setError(null)
    setIsLoading(true)
    try {
      if (hasIndividualMedidas) {
        const currentMedidas = [...(placaToEdit.medidas_individuales || [])]
        
        if (mode === 'subtract') {
          // Remove selected plates
          const newMedidas = currentMedidas.filter((_, i) => !selectedIndices.includes(i))
          await onSave(placaToEdit.id, newMedidas.length, newMedidas.length > 0 ? newMedidas : null)
        } else {
          // Add new plates
          const addCount = Math.floor(Number(amount)) || 0
          const largo = Number(newPlacaLargo) || 0
          const ancho = Number(newPlacaAncho) || 0
          if (largo <= 0 || ancho <= 0) {
            setError('Debes ingresar el largo y ancho de las nuevas placas.')
            setIsLoading(false)
            return
          }
          const newPlates: MedidaIndividual[] = Array(addCount).fill({ largo, ancho })
          const newMedidas = [...currentMedidas, ...newPlates]
          await onSave(placaToEdit.id, newMedidas.length, newMedidas)
        }
      } else {
        // Standard mode (all same size)
        await onSave(placaToEdit.id, newStock)
      }
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
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all translate-y-0 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/80 shrink-0">
          <div className="flex items-center gap-2 text-amber-600">
            <Minus size={20} className="text-amber-600" />
            <h2 className="text-lg font-bold text-zinc-900">Ajustar Stock</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-zinc-400 hover:text-zinc-700 bg-zinc-100/50 hover:bg-zinc-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <div className="mb-5">
            <p className="text-sm font-medium text-zinc-500 mb-1">Material</p>
            <p className="text-lg font-bold text-zinc-900 leading-tight">{placaToEdit.nombre}</p>
            <p className="text-sm text-zinc-500">{placaToEdit.material}</p>
          </div>

          {/* Current Stock Display */}
          <div className="mb-5 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Stock Actual</p>
            <p className="text-2xl font-bold text-zinc-900">{currentStock} <span className="text-sm font-medium text-zinc-500">placas</span></p>
            {m2Current > 0 && (
              <p className="text-sm text-zinc-500 mt-0.5">{m2Current} m² totales</p>
            )}
            {hasIndividualMedidas && (
              <p className="text-xs text-amber-600 mt-1 font-medium">⚡ Medidas individuales por placa</p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => { setMode('subtract'); setError(null); setSelectedIndices([]) }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                mode === 'subtract' 
                  ? 'bg-red-100 text-red-700 border-2 border-red-200' 
                  : 'bg-zinc-100 text-zinc-500 border-2 border-transparent hover:bg-zinc-200'
              }`}
            >
              <Minus size={16} /> Descontar
            </button>
            <button
              type="button"
              onClick={() => { setMode('add'); setError(null); setSelectedIndices([]) }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                mode === 'add' 
                  ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-200' 
                  : 'bg-zinc-100 text-zinc-500 border-2 border-transparent hover:bg-zinc-200'
              }`}
            >
              <Plus size={16} /> Agregar
            </button>
          </div>
          
          <form id="stock-form" onSubmit={handleSubmit}>
            {hasIndividualMedidas && mode === 'subtract' ? (
              /* Individual mode: Select which plates to remove */
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Selecciona las placas a descontar:
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {placaToEdit.medidas_individuales!.map((medida, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => togglePlateSelection(index)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        selectedIndices.includes(index)
                          ? 'border-red-300 bg-red-50'
                          : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                        selectedIndices.includes(index)
                          ? 'bg-red-500 border-red-500'
                          : 'border-zinc-300'
                      }`}>
                        {selectedIndices.includes(index) && <Check size={12} className="text-white" />}
                      </div>
                      <span className="text-xs font-bold text-zinc-400">#{index + 1}</span>
                      <span className="text-sm font-medium text-zinc-700 flex-1">
                        {medida.largo}m × {medida.ancho}m
                      </span>
                      <span className="text-xs text-zinc-400">
                        {Math.round(medida.largo * medida.ancho * 100) / 100} m²
                      </span>
                    </button>
                  ))}
                </div>
                {selectedIndices.length > 0 && (
                  <p className="text-sm text-red-600 font-medium mt-2">
                    {selectedIndices.length} placa{selectedIndices.length > 1 ? 's' : ''} seleccionada{selectedIndices.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            ) : hasIndividualMedidas && mode === 'add' ? (
              /* Individual mode: Add new plates with dimensions */
              <div className="space-y-4">
                <Input 
                  label="Cantidad de placas a agregar"
                  name="amount"
                  type="number" step="1" min="1" required 
                  value={amount} 
                  onChange={(e) => { setAmount(e.target.value); setError(null) }} 
                  className="text-lg text-center font-bold"
                  placeholder="Ej. 2"
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Largo (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={newPlacaLargo}
                      onChange={(e) => setNewPlacaLargo(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Ancho (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={newPlacaAncho}
                      onChange={(e) => setNewPlacaAncho(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <p className="text-xs text-zinc-400">Todas las placas nuevas tendrán estas dimensiones.</p>
              </div>
            ) : (
              /* Standard mode: simple amount */
              <Input 
                label={`Cantidad de placas a ${mode === 'subtract' ? 'descontar' : 'agregar'}`}
                name="amount"
                type="number" step="1" min="1" required 
                value={amount} 
                onChange={(e) => { setAmount(e.target.value); setError(null) }} 
                className="text-lg text-center font-bold"
                placeholder="Ej. 2"
                autoFocus
              />
            )}
          </form>

          {/* Preview of new stock */}
          {amountValue > 0 && (
            <div className={`mt-4 p-4 rounded-xl border ${newStock < 0 ? 'bg-red-50 border-red-200' : mode === 'add' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <ArrowDown size={14} className={newStock < 0 ? 'text-red-500' : mode === 'add' ? 'text-emerald-600' : 'text-amber-600'} />
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: newStock < 0 ? '#b91c1c' : mode === 'add' ? '#047857' : '#b45309' }}>
                  Stock Resultante
                </p>
              </div>
              <p className={`text-2xl font-bold ${newStock < 0 ? 'text-red-700' : mode === 'add' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {newStock} <span className="text-sm font-medium opacity-70">placas</span>
              </p>
              {newStock < 0 && (
                <p className="text-xs text-red-600 mt-1">No se puede descontar más del stock disponible.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex flex-col gap-3 shrink-0">
          <Button 
            type="submit" 
            form="stock-form" 
            disabled={isLoading || isInvalid}
            className="w-full text-base py-3"
          >
            {isLoading ? 'Guardando...' : `${mode === 'subtract' ? 'Descontar' : 'Agregar'} ${amountValue > 0 ? amountValue + ' placas' : ''}`}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} className="w-full">
            Cancelar
          </Button>
        </div>

      </div>
    </div>
  )
}
