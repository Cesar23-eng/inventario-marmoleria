import { createClient } from '@/lib/supabase/client'
import { Herramienta } from '@/types'
import { deleteImageFromSupabase } from './storage'

export async function getHerramientas(): Promise<Herramienta[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('herramientas')
    .select('*')
    .order('nombre', { ascending: true })

  if (error) {
    console.error('Detalles del error de Supabase:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    })
    throw new Error(error.message || 'Error al obtener las herramientas')
  }

  return data || []
}

export async function upsertHerramienta(herramienta: Partial<Herramienta>): Promise<Herramienta> {
  const supabase = createClient()
  
  let query = supabase.from('herramientas')
  
  if (herramienta.id) {
    // If ID exists, perform an update
    const { data, error } = await query
      .update({ ...herramienta })
      .eq('id', herramienta.id)
      .select()
      .single()
      
    if (error) {
      console.error('Error updating herramienta:', error)
      throw new Error(error.message || 'Error al actualizar la herramienta')
    }
    return data
  } else {
    // If no ID, perform an insert
    const { data, error } = await query
      .insert([{ ...herramienta }])
      .select()
      .single()
      
    if (error) {
      console.error('Error inserting herramienta:', error)
      throw new Error(error.message || 'Error al guardar la herramienta')
    }
    return data
  }
}

export async function upsertHerramientas(herramientas: Partial<Herramienta>[]): Promise<Herramienta[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('herramientas')
    .upsert(herramientas)
    .select()

  if (error) {
    console.error('Error batch upserting herramientas:', {
      code: error.code,
      message: error.message,
      details: error.details
    })
    throw new Error(error.message || 'Error al guardar las herramientas en lote')
  }

  return data || []
}

export async function deleteHerramienta(id: string): Promise<void> {
  const supabase = createClient()
  
  // 1. Fetch image to delete from Storage
  const { data: herramientaToDelete } = await supabase
    .from('herramientas')
    .select('imagen_url')
    .eq('id', id)
    .single()
    
  if (herramientaToDelete?.imagen_url) {
    await deleteImageFromSupabase(herramientaToDelete.imagen_url)
  }

  // 2. Delete from database
  const { error } = await supabase
    .from('herramientas')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting herramienta:', error)
    throw new Error('Error al eliminar la herramienta')
  }
}
