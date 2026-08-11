import React, { useRef, useState } from 'react'
import { Button } from './ui/Button'
import { Download, Upload } from 'lucide-react'
import { Herramienta } from '@/types'
import { exportarHerramientasAExcel, importarHerramientasDesdeExcel } from '@/services/excel'

interface HerramientasExcelActionsProps {
  herramientas: Herramienta[]
  onImport: (importedData: Partial<Herramienta>[]) => Promise<void>
}

export function HerramientasExcelActions({ herramientas, onImport }: HerramientasExcelActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)

  const handleExport = () => {
    exportarHerramientasAExcel(herramientas)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Por favor sube un archivo Excel válido (.xlsx o .xls)')
      return
    }

    setIsImporting(true)
    try {
      const importedData = await importarHerramientasDesdeExcel(file)
      await onImport(importedData)
      alert(`Se importaron ${importedData.length} herramientas exitosamente.`)
    } catch (error: any) {
      console.error('Error importing excel:', error)
      alert(error.message || 'Hubo un error al procesar el archivo Excel. Revisa el formato e inténtalo de nuevo.')
    } finally {
      setIsImporting(false)
      // Reset input so the same file can be uploaded again if needed
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
        onClick={() => fileInputRef.current?.click()}
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
