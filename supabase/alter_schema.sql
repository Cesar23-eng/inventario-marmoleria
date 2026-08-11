-- Corre este script en el SQL Editor de Supabase para actualizar tu tabla existente

-- 1. Añadir la columna de metros iniciales con valor por defecto de 0
ALTER TABLE public.placas 
ADD COLUMN IF NOT EXISTS metros_cuadrados_iniciales numeric(10, 2) DEFAULT 0;

-- 2. Asegurarse que metros sobrantes y otras medidas por defecto sean 0
ALTER TABLE public.placas 
ALTER COLUMN metros_cuadrados_sobrantes SET DEFAULT 0,
ALTER COLUMN largo SET DEFAULT 0,
ALTER COLUMN ancho SET DEFAULT 0,
ALTER COLUMN grosor SET DEFAULT 0;

-- 3. Asegurar que las políticas RLS siguen vigentes (solo por seguridad)
-- Esto ya debería estar habilitado de la instalación anterior.
