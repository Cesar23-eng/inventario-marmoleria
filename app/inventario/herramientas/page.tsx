'use client'

import React, { useState, useEffect } from 'react'
import { getHerramientas, upsertHerramienta, deleteHerramienta, upsertHerramientas } from '@/services/herramientas'
import { Herramienta } from '@/types'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { HerramientaFormModal } from '@/components/HerramientaFormModal'
import { QuickToolStockModal } from '@/components/QuickToolStockModal'
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal'
import { HerramientasExcelActions } from '@/components/HerramientasExcelActions'
import { ImagePreviewModal } from '@/components/ImagePreviewModal'
import { Plus, Edit2, Trash2, Search, Package, AlertCircle, Wrench, Zap, Image as ImageIcon } from 'lucide-react'

export default function HerramientasPage() {
  const [herramientas, setHerramientas] = useState<Herramienta[]>([])
  const [filteredHerramientas, setFilteredHerramientas] = useState<Herramienta[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isQuickStockOpen, setIsQuickStockOpen] = useState(false)
  const [toolToEdit, setToolToEdit] = useState<Herramienta | null>(null)
  
  // Image Preview Modal
  const [previewImage, setPreviewImage] = useState<{url: string, alt: string} | null>(null)
  
  // Deletion states
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [deleteIds, setDeleteIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchHerramientas = async () => {
    setIsLoading(true)
    try {
      const data = await getHerramientas()
      setHerramientas(data)
      setFilteredHerramientas(data)
    } catch (err: any) {
      console.error(err)
      // If table doesn't exist, this will prevent crashing and show an empty list
      setHerramientas([])
      setFilteredHerramientas([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHerramientas()
  }, [])

  useEffect(() => {
    if (!searchQuery) {
      setFilteredHerramientas(herramientas)
    } else {
      const lower = searchQuery.toLowerCase()
      setFilteredHerramientas(herramientas.filter(h => 
        h.nombre.toLowerCase().includes(lower) || 
        h.categoria.toLowerCase().includes(lower)
      ))
    }
  }, [searchQuery, herramientas])

  const handleSaveHerramienta = async (herramienta: Partial<Herramienta>) => {
    const saved = await upsertHerramienta(herramienta)
    setHerramientas(prev => {
      const exists = prev.find(h => h.id === saved.id)
      if (exists) {
        return prev.map(h => h.id === saved.id ? saved : h)
      }
      return [saved, ...prev]
    })
  }

  const handleUpdateStock = async (id: string, newStock: number) => {
    const saved = await upsertHerramienta({ id, cantidad_disponible: newStock })
    setHerramientas(prev => prev.map(h => h.id === saved.id ? saved : h))
  }

  const openDeleteConfirm = (ids: string[]) => {
    setDeleteIds(ids)
    setIsDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      // In a real bulk scenario we would have deleteHerramientas, but here we just loop or call it.
      // For this spec, we are mainly doing individual delete but reusing the modal.
      for (const id of deleteIds) {
        await deleteHerramienta(id)
      }
      
      // Update local state instantly
      const newHerramientas = herramientas.filter(h => !deleteIds.includes(h.id))
      setHerramientas(newHerramientas)
      
      setIsDeleteConfirmOpen(false)
    } catch (err: any) {
      alert(err.message || 'Error al eliminar la herramienta')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleImportHerramientas = async (importedData: Partial<Herramienta>[]) => {
    try {
      await upsertHerramientas(importedData)
      await fetchHerramientas()
    } catch (err: any) {
      console.error(err)
      throw err // Let the ExcelActions component catch and show the alert
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">Herramientas</h1>
          <p className="text-zinc-500 mt-2 text-base md:text-lg">Gestiona el inventario de herramientas, discos y accesorios</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <HerramientasExcelActions herramientas={herramientas} onImport={handleImportHerramientas} />
          <Button 
            onClick={() => { setToolToEdit(null); setIsFormModalOpen(true); }}
            icon={<Plus size={18} />}
          >
            Nueva Herramienta
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-100 flex flex-col md:flex-row gap-4 justify-between bg-zinc-50/50">
          <div className="relative w-full md:max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center text-sm text-zinc-500 bg-white px-4 py-2 rounded-xl border border-zinc-200 shadow-sm">
            <Package size={16} className="mr-2 opacity-50" />
            <span className="font-semibold text-zinc-900 mr-1">{filteredHerramientas.length}</span> herramientas
          </div>
        </div>

        {/* State Views */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 text-zinc-400 gap-3">
            <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
            <p className="font-medium animate-pulse">Cargando inventario...</p>
          </div>
        ) : filteredHerramientas.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 text-zinc-400 gap-3">
            <div className="bg-zinc-50 p-4 rounded-full">
              <AlertCircle size={32} className="text-zinc-300" />
            </div>
            <p className="text-lg">No se encontraron herramientas</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards (hidden on md and up) */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
              {filteredHerramientas.map((tool) => (
                <div key={tool.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4 transition-colors">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-3">
                      {/* Mobile Thumbnail */}
                      <div 
                        className={`w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-200 shrink-0 overflow-hidden flex items-center justify-center ${tool.imagen_url ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                        onClick={() => tool.imagen_url && setPreviewImage({ url: tool.imagen_url, alt: tool.nombre })}
                      >
                        {tool.imagen_url ? (
                          <img src={tool.imagen_url} alt={tool.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-zinc-300" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900 text-lg leading-tight">{tool.nombre}</h3>
                        <p className="text-zinc-500 text-sm mt-0.5">{tool.categoria}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end mt-2 pt-4 border-t border-zinc-100">
                    <div>
                      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Stock</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${tool.cantidad_disponible > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        <span className="font-bold text-zinc-800 text-xl">{tool.cantidad_disponible} <span className="text-sm font-medium text-zinc-500">uds</span></span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        className="h-9 w-9 p-0 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-full"
                        onClick={() => { setToolToEdit(tool); setIsFormModalOpen(true); }}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                        onClick={() => openDeleteConfirm([tool.id])}
                      >
                        <Trash2 size={16} />
                      </Button>
                      <Button 
                        variant="primary"
                        className="bg-amber-100 text-amber-700 hover:bg-amber-200 hover:text-amber-800 shadow-none border-none py-2 px-4"
                        onClick={() => { setToolToEdit(tool); setIsQuickStockOpen(true); }}
                        icon={<Zap size={16} className="fill-amber-700" />}
                      >
                        Stock
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (hidden on mobile) */}
            <Table className="hidden md:table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Foto</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Stock Disponible</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHerramientas.map((tool) => (
                  <TableRow key={tool.id}>
                    <TableCell>
                      <div 
                        className={`w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center ${tool.imagen_url ? 'cursor-pointer hover:opacity-80 transition-opacity ring-2 ring-transparent hover:ring-zinc-200' : ''}`}
                        onClick={() => tool.imagen_url && setPreviewImage({ url: tool.imagen_url, alt: tool.nombre })}
                      >
                        {tool.imagen_url ? (
                          <img src={tool.imagen_url} alt={tool.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-zinc-300" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-zinc-900 block">{tool.nombre}</span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700">
                        {tool.categoria}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${tool.cantidad_disponible > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        <span className="font-semibold text-zinc-900 text-base">{tool.cantidad_disponible}</span>
                        <span className="text-zinc-500 text-sm">uds</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          onClick={() => { setToolToEdit(tool); setIsQuickStockOpen(true); }}
                        >
                          <Zap size={16} className="mr-1 fill-amber-600" />
                          Stock
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-700"
                          onClick={() => { setToolToEdit(tool); setIsFormModalOpen(true); }}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => openDeleteConfirm([tool.id])}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </div>

      {/* Modals */}
      <HerramientaFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveHerramienta}
        herramientaToEdit={toolToEdit}
      />

      <QuickToolStockModal
        isOpen={isQuickStockOpen}
        onClose={() => setIsQuickStockOpen(false)}
        onSave={handleUpdateStock}
        toolToEdit={toolToEdit}
      />

      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        isMultiple={deleteIds.length > 1}
        count={deleteIds.length}
        isDeleting={isDeleting}
      />

      <ImagePreviewModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage?.url || null}
        altText={previewImage?.alt || ''}
      />
    </div>
  )
}
