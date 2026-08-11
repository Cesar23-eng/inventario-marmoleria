import { createClient } from '@/lib/supabase/client'
import { Placa } from '@/types'
import { deleteImageFromSupabase } from './storage'

export async function getPlacas(): Promise<Placa[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('placas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Detalles del error de Supabase:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    })
    throw new Error(error.message || 'Error al obtener las placas')
  }

  return data || []
}

export async function upsertPlaca(placa: Partial<Placa>): Promise<Placa> {
  const supabase = createClient()
  
  let query = supabase.from('placas')
  
  if (placa.id) {
    // If ID exists, perform an update
    const { data, error } = await query
      .update({ ...placa, updated_at: new Date().toISOString() })
      .eq('id', placa.id)
      .select()
      .single()
      
    if (error) {
      console.error('Error updating placa:', error)
      throw new Error(error.message || 'Error al actualizar la placa')
    }
    return data
  } else {
    // If no ID, perform an insert
    const { data, error } = await query
      .insert([{ ...placa, updated_at: new Date().toISOString() }])
      .select()
      .single()
      
    if (error) {
      console.error('Error inserting placa:', error)
      throw new Error(error.message || 'Error al guardar la placa')
    }
    return data
  }
}

export async function deletePlaca(id: string): Promise<void> {
  return deletePlacas([id])
}

export async function deletePlacas(ids: string[]): Promise<void> {
  const supabase = createClient()
  
  // 1. Fetch images to delete from Storage
  const { data: placasToDelete } = await supabase
    .from('placas')
    .select('imagen_url')
    .in('id', ids)
    
  if (placasToDelete) {
    for (const placa of placasToDelete) {
      if (placa.imagen_url) {
        await deleteImageFromSupabase(placa.imagen_url)
      }
    }
  }

  // 2. Delete from database
  const { error } = await supabase
    .from('placas')
    .delete()
    .in('id', ids)

  if (error) {
    console.error('Error deleting placas:', error)
    throw new Error('Error al eliminar las placas')
  }
}
