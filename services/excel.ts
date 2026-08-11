import * as XLSX from 'xlsx'
import { Placa, Herramienta } from '@/types'

export function exportarPlacasAExcel(placas: Placa[]) {
  const worksheet = XLSX.utils.json_to_sheet(placas.map(p => ({
    id: p.id,
    nombre: p.nombre,
    material: p.material,
    lote: p.lote || '',
    largo: p.largo,
    ancho: p.ancho,
    grosor: p.grosor,
    metros_cuadrados_iniciales: p.metros_cuadrados_iniciales,
    metros_cuadrados_sobrantes: p.metros_cuadrados_sobrantes,
    ubicacion: p.ubicacion || '',
    precio_m2: p.precio_m2 || ''
  })))
  
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Placas")
  
  XLSX.writeFile(workbook, "inventario_placas.xlsx")
}

export function importarPlacasDesdeExcel(file: File): Promise<Partial<Placa>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const json = XLSX.utils.sheet_to_json(worksheet)
        
        // Parse the parsed JSON back into Partial<Placa>
        const placas = json.map((row: any) => {
          // Buscamos dinámicamente las llaves por si el excel viene con diferentes nombres
          const keys = Object.keys(row);
          
          const findKey = (searchTerms: string[]) => 
            keys.find(k => searchTerms.some(term => k.toLowerCase().includes(term.toLowerCase())));
            
          const keyNombre = findKey(['nombre', 'material', 'producto']) || 'nombre';
          const keyPrecio = findKey(['precio', 'costo']) || 'precio_m2';
          const keyLargo = findKey(['largo', 'largo_m', 'longitud']) || 'largo';
          const keyAncho = findKey(['ancho', 'ancho_m', 'anchura']) || 'ancho';
          const keyGrosor = findKey(['grosor', 'espesor']) || 'grosor';
          
          return {
            id: row.id || undefined, // undefined for new records
            nombre: row[keyNombre]?.toString() || 'Placa sin nombre',
            material: row.material?.toString() || 'Mármol/Granito',
            lote: row.lote?.toString() || null,
            largo: Number(row[keyLargo]) || 0,
            ancho: Number(row[keyAncho]) || 0,
            grosor: Number(row[keyGrosor]) || 0,
            metros_cuadrados_iniciales: Number(row.metros_cuadrados_iniciales) || 0,
            metros_cuadrados_sobrantes: Number(row.metros_cuadrados_sobrantes) || 0,
            ubicacion: row.ubicacion?.toString() || null,
            precio_m2: row[keyPrecio] ? Number(row[keyPrecio]) : null
          }
        })
        
        resolve(placas)
      } catch (err) {
        reject(err)
      }
    }
    reader.readAsArrayBuffer(file)
  })
}

export function exportarHerramientasAExcel(herramientas: Herramienta[]) {
  const worksheet = XLSX.utils.json_to_sheet(herramientas.map(h => ({
    Nombre_Herramienta: h.nombre,
    Categoria: h.categoria,
    Cantidad_Disponible: h.cantidad_disponible
  })))
  
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Herramientas")
  
  XLSX.writeFile(workbook, "inventario_herramientas.xlsx")
}

export function importarHerramientasDesdeExcel(file: File): Promise<Partial<Herramienta>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Ensure "Herramientas" sheet exists
        const sheetName = workbook.SheetNames.find(s => s.toLowerCase() === 'herramientas')
        if (!sheetName) {
          throw new Error('El archivo no contiene la pestaña "Herramientas".')
        }

        const worksheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(worksheet)
        
        const herramientas = json.map((row: any) => {
          const keys = Object.keys(row);
          const findKey = (searchTerms: string[]) => 
            keys.find(k => searchTerms.some(term => k.toLowerCase().includes(term.toLowerCase())));
            
          const keyNombre = findKey(['nombre', 'herramienta']) || 'Nombre_Herramienta';
          const keyCategoria = findKey(['categoria', 'categoría']) || 'Categoria';
          const keyCantidad = findKey(['cantidad', 'disponible']) || 'Cantidad_Disponible';

          return {
            nombre: row[keyNombre]?.toString() || 'Herramienta sin nombre',
            categoria: row[keyCategoria]?.toString() || 'Sin Categoría',
            cantidad_disponible: Number(row[keyCantidad]) || 0
          }
        })
        
        resolve(herramientas)
      } catch (err) {
        reject(err)
      }
    }
    reader.readAsArrayBuffer(file)
  })
}
