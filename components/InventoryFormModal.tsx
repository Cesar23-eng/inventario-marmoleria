'use client'

import React, { useState, useEffect } from 'react'
import { Placa, MedidaIndividual } from '@/types'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { X, Save, Image as ImageIcon, Plus, Trash2 } from 'lucide-react'
import { uploadImageToSupabase } from '@/services/storage'

interface InventoryFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (placa: Partial<Placa>) => Promise<void>
  placaToEdit?: Placa | null
}

type MedidasMode = 'iguales' | 'individuales'

export function InventoryFormModal({ isOpen, onClose, onSave, placaToEdit }: InventoryFormModalProps) {
  const [formData, setFormData] = useState<Partial<Placa>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [medidasMode, setMedidasMode] = useState<MedidasMode>('iguales')
  const [medidasList, setMedidasList] = useState<MedidaIndividual[]>([])

  useEffect(() => {
    if (isOpen) {
      if (placaToEdit) {
        setFormData(placaToEdit)
        setPreviewUrl(placaToEdit.imagen_url || null)
        // Detect mode from existing data
        if (placaToEdit.medidas_individuales && placaToEdit.medidas_individuales.length > 0) {
          setMedidasMode('individuales')
          setMedidasList([...placaToEdit.medidas_individuales])
        } else {
          setMedidasMode('iguales')
          setMedidasList([])
        }
      } else {
        setFormData({
          nombre: '',
          material: '',
          lote: '',
          ubicacion: ''
        })
        setPreviewUrl(null)
        setMedidasMode('iguales')
        setMedidasList([])
      }
      setImageFile(null)
      setError(null)
    }
  }, [isOpen, placaToEdit])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const type = 'type' in e.target ? (e.target as HTMLInputElement).type : 'text'
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : '') : value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
    }
  }

  // --- Individual Medidas Handlers ---
  const addMedida = () => {
    setMedidasList(prev => [...prev, { largo: 0, ancho: 0 }])
  }

  const removeMedida = (index: number) => {
    setMedidasList(prev => prev.filter((_, i) => i !== index))
  }

  const updateMedida = (index: number, field: 'largo' | 'ancho', value: number) => {
    setMedidasList(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (medidasMode === 'individuales' && medidasList.length === 0) {
      setError('Debes agregar al menos una placa con sus medidas.')
      return
    }

    setIsSubmitting(true)
    try {
      let finalImageUrl = formData.imagen_url
      
      if (imageFile) {
        finalImageUrl = await uploadImageToSupabase(imageFile)
      }

      const isIndividual = medidasMode === 'individuales'

      await onSave({
        ...formData,
        imagen_url: finalImageUrl,
        largo: isIndividual ? 0 : (Number(formData.largo) || 0),
        ancho: isIndividual ? 0 : (Number(formData.ancho) || 0),
        grosor: formData.grosor ? Number(formData.grosor) : null,
        cantidad_placas: isIndividual ? medidasList.length : (Math.floor(Number(formData.cantidad_placas)) || 0),
        medidas_individuales: isIndividual ? medidasList : null,
        precio_m2: formData.precio_m2 ? Number(formData.precio_m2) : null
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Error al guardar la placa')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate live m² total for individual mode
  const m2Individual = medidasList.reduce((sum, m) => sum + (m.largo * m.ancho), 0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <h2 className="text-xl font-semibold text-zinc-800">
            {placaToEdit ? 'Editar Placa' : 'Nueva Placa'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[70vh] p-6 custom-scrollbar">
          {error && (
            <div className="mb-4 p-4 text-sm text-red-800 bg-red-50 rounded-xl border border-red-100">
              {error}
            </div>
          )}
          
          <form id="placa-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Foto Section */}
            <div>
              <h3 className="text-sm font-bold text-zinc-900 mb-3 uppercase tracking-wider">Foto del Material</h3>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-zinc-100 rounded-xl border border-zinc-200 overflow-hidden flex items-center justify-center shrink-0">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={24} className="text-zinc-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    id="image-upload"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <label 
                    htmlFor="image-upload" 
                    className="inline-block px-4 py-2 bg-white border border-zinc-200 text-zinc-700 text-sm font-medium rounded-lg cursor-pointer hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
                  >
                    Seleccionar Foto
                  </label>
                  <p className="text-xs text-zinc-500 mt-2">Formatos JPG o PNG.</p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="col-span-1 md:col-span-2">
                <Input 
                  label="Nombre de la placa" 
                  name="nombre"
                  required 
                  value={formData.nombre || ''} 
                  onChange={handleChange} 
                  placeholder="Ej. Marmol Carrara Supremo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Material</label>
                <select
                  name="material"
                  required
                  value={formData.material || ''}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Seleccionar material...</option>
                  <option value="Marmol">Marmol</option>
                  <option value="Granito">Granito</option>
                  <option value="Piedra Sinterizada">Piedra Sinterizada</option>
                  <option value="Cuarzo">Cuarzo</option>
                  <option value="Cuarcita">Cuarcita</option>
                </select>
              </div>
              <Input 
                label="Lote" 
                name="lote"
                value={formData.lote || ''} 
                onChange={handleChange} 
                placeholder="Ej. L-4509"
              />
            </div>

            {/* Medidas Section */}
            <div>
              <h3 className="text-sm font-bold text-zinc-900 mb-3 uppercase tracking-wider">Dimensiones</h3>
              
              {/* Toggle */}
              <div className="flex gap-2 mb-5">
                <button
                  type="button"
                  onClick={() => setMedidasMode('iguales')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                    medidasMode === 'iguales' 
                      ? 'bg-zinc-900 text-white shadow-sm' 
                      : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                  }`}
                >
                  Todas iguales
                </button>
                <button
                  type="button"
                  onClick={() => setMedidasMode('individuales')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                    medidasMode === 'individuales' 
                      ? 'bg-zinc-900 text-white shadow-sm' 
                      : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                  }`}
                >
                  Medidas individuales
                </button>
              </div>

              {medidasMode === 'iguales' ? (
                /* Mode: Todas iguales */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <Input 
                    label="Largo (m)" 
                    name="largo"
                    type="number" step="0.01" required 
                    value={formData.largo || ''} 
                    onChange={handleChange} 
                  />
                  <Input 
                    label="Ancho (m)" 
                    name="ancho"
                    type="number" step="0.01" required 
                    value={formData.ancho || ''} 
                    onChange={handleChange} 
                  />
                  <Input 
                    label="Cantidad de Placas" 
                    name="cantidad_placas"
                    type="number" step="1" min="0" required 
                    value={formData.cantidad_placas ?? ''} 
                    onChange={handleChange} 
                    placeholder="Ej. 5"
                  />
                </div>
              ) : (
                /* Mode: Medidas individuales */
                <div className="space-y-3">
                  {medidasList.length === 0 && (
                    <p className="text-sm text-zinc-400 italic text-center py-4">
                      No hay placas agregadas. Usa el botón de abajo para agregar.
                    </p>
                  )}
                  
                  {medidasList.map((medida, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100 group">
                      <span className="text-xs font-bold text-zinc-400 w-8 shrink-0">#{index + 1}</span>
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">Largo (m)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={medida.largo || ''}
                            onChange={(e) => updateMedida(index, 'largo', Number(e.target.value) || 0)}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">Ancho (m)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={medida.ancho || ''}
                            onChange={(e) => updateMedida(index, 'ancho', Number(e.target.value) || 0)}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <span className="text-xs text-zinc-400 w-16 text-right shrink-0">
                        {Math.round(medida.largo * medida.ancho * 100) / 100} m²
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMedida(index)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addMedida}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-zinc-200 text-zinc-500 text-sm font-medium hover:border-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-all"
                  >
                    <Plus size={16} /> Agregar placa
                  </button>

                  {/* Summary */}
                  {medidasList.length > 0 && (
                    <div className="flex items-center justify-between px-3 py-2.5 bg-zinc-100 rounded-xl text-sm">
                      <span className="font-semibold text-zinc-700">{medidasList.length} placas</span>
                      <span className="text-zinc-500">{Math.round(m2Individual * 100) / 100} m² totales</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input 
                label="Grosor (cm)" 
                name="grosor"
                type="number" step="0.01" 
                value={formData.grosor || ''} 
                onChange={handleChange} 
                placeholder="Opcional"
              />
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Ubicación</label>
                <select
                  name="ubicacion"
                  value={formData.ubicacion || ''}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Seleccionar ubicación...</option>
                  <option value="Sector A">Sector A</option>
                  <option value="Sector B">Sector B</option>
                  <option value="Sector C">Sector C</option>
                  <option value="Deposito">Deposito</option>
                </select>
              </div>
              <Input 
                label="Precio por M² ($)" 
                name="precio_m2"
                type="number" step="0.01" 
                value={formData.precio_m2 || ''} 
                onChange={handleChange} 
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3 bg-zinc-50/50">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            form="placa-form" 
            disabled={isSubmitting}
            icon={<Save size={18} />}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Placa'}
          </Button>
        </div>

      </div>
    </div>
  )
}
