'use client'

import React, { useState, useEffect } from 'react'
import { Placa } from '@/types'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { X, Save, Image as ImageIcon } from 'lucide-react'
import { uploadImageToSupabase } from '@/services/storage'

interface InventoryFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (placa: Partial<Placa>) => Promise<void>
  placaToEdit?: Placa | null
}

export function InventoryFormModal({ isOpen, onClose, onSave, placaToEdit }: InventoryFormModalProps) {
  const [formData, setFormData] = useState<Partial<Placa>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      if (placaToEdit) {
        setFormData(placaToEdit)
        setPreviewUrl(placaToEdit.imagen_url || null)
      } else {
        setFormData({
          nombre: '',
          material: '',
          lote: '',
          ubicacion: ''
        })
        setPreviewUrl(null)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      let finalImageUrl = formData.imagen_url
      
      if (imageFile) {
        finalImageUrl = await uploadImageToSupabase(imageFile)
      }

      await onSave({
        ...formData,
        imagen_url: finalImageUrl,
        largo: Number(formData.largo) || 0,
        ancho: Number(formData.ancho) || 0,
        grosor: Number(formData.grosor) || 0,
        metros_cuadrados_iniciales: Number(formData.metros_cuadrados_iniciales) || 0,
        metros_cuadrados_sobrantes: Number(formData.metros_cuadrados_sobrantes) || 0,
        precio_m2: formData.precio_m2 ? Number(formData.precio_m2) : null
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Error al guardar la placa')
    } finally {
      setIsSubmitting(false)
    }
  }

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
              label="Grosor (cm)" 
              name="grosor"
              type="number" step="0.01" required 
              value={formData.grosor || ''} 
              onChange={handleChange} 
            />

            <Input 
              label="Ubicación" 
              name="ubicacion"
              value={formData.ubicacion || ''} 
              onChange={handleChange} 
              placeholder="Ej. Rack A"
            />
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
