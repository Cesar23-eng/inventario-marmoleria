'use client'

import React, { useRef, useState } from 'react'
import { Button } from './ui/Button'
import { Download, Upload } from 'lucide-react'
import { exportarPlacasAExcel, importarPlacasDesdeExcel } from '@/services/excel'
import { Placa } from '@/types'

interface ExcelActionsProps {
  placas: Placa[]
  onImport: (placas: Partial<Placa>[]) => Promise<void>
}

export function ExcelActions({ placas, onImport }: ExcelActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  
  const handleExport = () => {
    exportarPlacasAExcel(placas)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const data = await importarPlacasDesdeExcel(file)
      await onImport(data)
      alert(`Se importaron ${data.length} placas exitosamente.`)
    } catch (error: any) {
      console.error('Error importando excel:', error)
      alert(error.message || 'Hubo un error al procesar el archivo Excel. Revisa el formato e inténtalo de nuevo.')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="flex gap-2">
      <Button 
        variant="ghost" 
        onClick={handleExport}
        className="text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
        icon={<Download size={18} />}
      >
        Exportar Excel
      </Button>
      
      <Button 
        variant="ghost" 
        onClick={handleImportClick}
        disabled={isImporting}
        className="text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100"
        icon={<Upload size={18} />}
      >
        {isImporting ? 'Importando...' : 'Importar Excel'}
      </Button>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        accept=".xlsx, .xls"
        className="hidden"
      />
    </div>
  )
}
