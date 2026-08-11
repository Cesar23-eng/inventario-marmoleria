import { createClient } from '@/lib/supabase/client'

export async function uploadImageToSupabase(file: File): Promise<string> {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const randomString = Math.random().toString(36).substring(2, 9)
  const fileName = `${Date.now()}-${randomString}.${fileExt}`
  const filePath = `${fileName}`

  const { data, error } = await supabase.storage
    .from('inventario_imagenes')
    .upload(filePath, file)

  if (error) {
    console.error('Error al subir imagen:', error)
    throw new Error('No se pudo subir la imagen al servidor.')
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('inventario_imagenes')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

export async function deleteImageFromSupabase(publicUrl: string): Promise<void> {
  if (!publicUrl) return
  
  const supabase = createClient()
  
  try {
    // Extract file path from public URL
    // Format is typically: https://[projectId].supabase.co/storage/v1/object/public/inventario_imagenes/[fileName]
    const parts = publicUrl.split('/')
    const fileName = parts[parts.length - 1]
    
    if (fileName) {
      const { error } = await supabase.storage
        .from('inventario_imagenes')
        .remove([fileName])
        
      if (error) {
        console.error('Error al borrar imagen de Storage:', error)
      }
    }
  } catch (err) {
    console.error('Error extrayendo nombre de archivo:', err)
  }
}
