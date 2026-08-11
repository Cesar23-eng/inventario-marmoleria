'use client'

import React, { useState, useEffect } from 'react'
import { getPlacas, upsertPlaca, deletePlacas } from '@/services/placas'
import { Placa } from '@/types'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { InventoryFormModal } from '@/components/InventoryFormModal'
import { QuickStockModal } from '@/components/QuickStockModal'
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal'
import { ExcelActions } from '@/components/ExcelActions'
import { ImagePreviewModal } from '@/components/ImagePreviewModal'
import { Plus, Edit2, Trash2, Search, AlertCircle, Package, Zap, Image as ImageIcon } from 'lucide-react'

export default function PlacasPage() {
  const [placas, setPlacas] = useState<Placa[]>([])
  const [filteredPlacas, setFilteredPlacas] = useState<Placa[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isQuickStockOpen, setIsQuickStockOpen] = useState(false)
  const [placaToEdit, setPlacaToEdit] = useState<Placa | null>(null)
  
  // Image Preview Modal
  const [previewImage, setPreviewImage] = useState<{url: string, alt: string} | null>(null)
  
  // Selection and Deletion states
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [deleteIds, setDeleteIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchPlacas = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getPlacas()
      setPlacas(data)
      setFilteredPlacas(data)
    } catch (err: any) {
      setError(err.message || 'Error cargando las placas')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPlacas()
  }, [])

  useEffect(() => {
    const query = searchQuery.toLowerCase()
    const filtered = placas.filter(p => 
      p.nombre.toLowerCase().includes(query) || 
      p.material.toLowerCase().includes(query) ||
      (p.lote && p.lote.toLowerCase().includes(query))
    )
    setFilteredPlacas(filtered)
  }, [searchQuery, placas])

  const handleSavePlaca = async (placa: Partial<Placa>) => {
    await upsertPlaca(placa)
    await fetchPlacas()
  }

  const handleUpdateStock = async (id: string, newStock: number) => {
    await upsertPlaca({ id, metros_cuadrados_sobrantes: newStock })
    await fetchPlacas()
  }

  const openDeleteConfirm = (ids: string[]) => {
    setDeleteIds(ids)
    setIsDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      await deletePlacas(deleteIds)
      
      // Update local state to remove deleted items instantly without a full reload wait
      const newPlacas = placas.filter(p => !deleteIds.includes(p.id))
      setPlacas(newPlacas)
      setFilteredPlacas(newPlacas.filter(p => 
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.material.toLowerCase().includes(searchQuery.toLowerCase())
      ))
      
      setIsDeleteConfirmOpen(false)
      // Optional: Show a success toast here
    } catch (err: any) {
      alert(err.message || 'Error al eliminar las placas')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleImportPlacas = async (importedPlacas: Partial<Placa>[]) => {
    try {
      // Usar Promise.all para upsertar todas
      await Promise.all(importedPlacas.map(p => upsertPlaca(p)))
      await fetchPlacas()
      alert('Importación completada con éxito')
    } catch (err) {
      alert('Hubo un error importando algunas placas. Revisa la consola.')
      console.error(err)
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Inventario de Placas</h1>
          <p className="text-zinc-500 mt-1">Gestiona las placas de mármol, granito y cuarzo.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <ExcelActions placas={placas} onImport={handleImportPlacas} />
          <Button 
            onClick={() => { setPlacaToEdit(null); setIsModalOpen(true); }}
            icon={<Plus size={18} />}
          >
            Nueva Placa
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-2 border border-zinc-200 rounded-xl shadow-sm flex items-center gap-3">
        <div className="pl-3 text-zinc-400">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Buscar por nombre, material o lote..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 border-0 focus:ring-0 py-2 text-zinc-700 placeholder:text-zinc-400 bg-transparent"
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Table section */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-zinc-500 animate-pulse">
            Cargando inventario...
          </div>
        ) : filteredPlacas.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 mb-4">
              <Package size={32} />
            </div>
            <h3 className="text-lg font-medium text-zinc-900">No hay placas encontradas</h3>
            <p className="text-zinc-500 mt-1 max-w-sm">No se encontraron placas que coincidan con tu búsqueda o el inventario está vacío.</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards (hidden on md and up) */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
              {filteredPlacas.map((placa) => (
                <div key={placa.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4 transition-colors">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-3">
                      {/* Mobile Thumbnail */}
                      <div 
                        className={`w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-200 shrink-0 overflow-hidden flex items-center justify-center ${placa.imagen_url ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                        onClick={() => placa.imagen_url && setPreviewImage({ url: placa.imagen_url, alt: placa.nombre })}
                      >
                        {placa.imagen_url ? (
                          <img src={placa.imagen_url} alt={placa.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-zinc-300" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900 text-lg leading-tight">{placa.nombre}</h3>
                        <p className="text-zinc-500 text-sm mt-0.5">{placa.material}</p>
                      </div>
                    </div>
                    {placa.precio_m2 && (
                      <span className="text-sm text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-bold whitespace-nowrap">
                        ${placa.precio_m2}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-end mt-2 pt-4 border-t border-zinc-100">
                    <div>
                      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Stock Actual</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${placa.metros_cuadrados_sobrantes > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        <span className="font-bold text-zinc-800 text-xl">{placa.metros_cuadrados_sobrantes} <span className="text-sm font-medium text-zinc-500">m²</span></span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                        onClick={() => openDeleteConfirm([placa.id])}
                      >
                        <Trash2 size={16} />
                      </Button>
                      <Button 
                        variant="primary"
                        className="bg-amber-100 text-amber-700 hover:bg-amber-200 hover:text-amber-800 shadow-none border-none py-2 px-4"
                        onClick={() => { setPlacaToEdit(placa); setIsQuickStockOpen(true); }}
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
                  <TableHead>Nombre / Material</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Dimensiones</TableHead>
                  <TableHead>M² Disp.</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlacas.map((placa) => (
                  <TableRow key={placa.id}>
                    <TableCell>
                      <div 
                        className={`w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center ${placa.imagen_url ? 'cursor-pointer hover:opacity-80 transition-opacity ring-2 ring-transparent hover:ring-zinc-200' : ''}`}
                        onClick={() => placa.imagen_url && setPreviewImage({ url: placa.imagen_url, alt: placa.nombre })}
                      >
                        {placa.imagen_url ? (
                          <img src={placa.imagen_url} alt={placa.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-zinc-300" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-zinc-900 block">{placa.nombre}</span>
                      <span className="text-sm text-zinc-500">{placa.material} {placa.lote ? `- Lote: ${placa.lote}` : ''}</span>
                    </TableCell>
                    <TableCell>
                      {placa.precio_m2 ? (
                        <span className="font-medium text-zinc-700">${placa.precio_m2}/m²</span>
                      ) : <span className="text-zinc-400">-</span>}
                    </TableCell>
                    <TableCell>
                      <span className="text-zinc-600 text-sm">
                        {(!placa.largo || placa.largo === 0) && (!placa.ancho || placa.ancho === 0) 
                          ? <span className="text-zinc-400 italic">Sin definir</span>
                          : `${placa.largo}m × ${placa.ancho}m`
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${placa.metros_cuadrados_sobrantes > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        <span className="font-bold text-zinc-700">{placa.metros_cuadrados_sobrantes} m²</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700 font-medium"
                          onClick={() => { setPlacaToEdit(placa); setIsQuickStockOpen(true); }}
                          icon={<Zap size={14} className="fill-amber-600" />}
                        >
                          Stock
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-700"
                          onClick={() => { setPlacaToEdit(placa); setIsModalOpen(true); }}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => openDeleteConfirm([placa.id])}
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

      <InventoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePlaca}
        placaToEdit={placaToEdit}
      />

      <QuickStockModal
        isOpen={isQuickStockOpen}
        onClose={() => setIsQuickStockOpen(false)}
        onSave={handleUpdateStock}
        placaToEdit={placaToEdit}
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
