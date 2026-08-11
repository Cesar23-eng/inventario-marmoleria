import React, { useState, useEffect } from 'react'
import { Herramienta } from '@/types'
import { Button } from './ui/Button'
import { X, Wrench, Image as ImageIcon } from 'lucide-react'
import { uploadImageToSupabase } from '@/services/storage'

interface HerramientaFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (herramienta: Partial<Herramienta>) => Promise<void>
  herramientaToEdit?: Herramienta | null
}

export function HerramientaFormModal({ isOpen, onClose, onSave, herramientaToEdit }: HerramientaFormModalProps) {
  const [formData, setFormData] = useState<Partial<Herramienta>>({
    nombre: '',
    categoria: '',
    cantidad_disponible: 0
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (herramientaToEdit) {
      setFormData(herramientaToEdit)
      setPreviewUrl(herramientaToEdit.imagen_url || null)
    } else {
      setFormData({
        nombre: '',
        categoria: '',
        cantidad_disponible: 0
      })
      setPreviewUrl(null)
    }
    setImageFile(null)
  }, [herramientaToEdit, isOpen])

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cantidad_disponible' ? Number(value) : value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      let finalImageUrl = formData.imagen_url
      
      if (imageFile) {
        finalImageUrl = await uploadImageToSupabase(imageFile)
      }

      await onSave({
        ...formData,
        imagen_url: finalImageUrl
      })
      onClose()
    } catch (error) {
      console.error(error)
      alert('Error al guardar la herramienta. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <div className="flex items-center gap-2 text-zinc-800">
            <Wrench size={20} className="text-amber-500" />
            <h2 className="text-lg font-bold">{herramientaToEdit ? 'Editar Herramienta' : 'Nueva Herramienta'}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 bg-white hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto max-h-[70vh] p-6 custom-scrollbar">
          <form id="herramienta-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Foto Section */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 mb-2">Foto de la Herramienta</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-zinc-100 rounded-xl border border-zinc-200 overflow-hidden flex items-center justify-center shrink-0">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={20} className="text-zinc-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    id="herramienta-image-upload"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <label 
                    htmlFor="herramienta-image-upload" 
                    className="inline-block px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 text-sm font-medium rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors"
                  >
                    Seleccionar Foto
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-700">Nombre de la Herramienta *</label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all"
                placeholder="Ej. Disco Diamantado 4.5"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-700">Categoría *</label>
              <input
                type="text"
                name="categoria"
                required
                value={formData.categoria || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all"
                placeholder="Ej. Discos, Lijas, Fresas..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-700">Cantidad Inicial *</label>
              <input
                type="number"
                name="cantidad_disponible"
                required
                min="0"
                value={formData.cantidad_disponible || 0}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all font-mono"
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3 bg-zinc-50/50">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            form="herramienta-form"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : (herramientaToEdit ? 'Actualizar' : 'Guardar Herramienta')}
          </Button>
        </div>

      </div>
    </div>
  )
}
