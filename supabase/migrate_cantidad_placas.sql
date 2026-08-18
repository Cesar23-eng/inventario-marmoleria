-- ============================================================
-- MIGRACIÓN: De metros cuadrados a cantidad de placas
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. Eliminar columnas de metros cuadrados (ya no se usan)
ALTER TABLE public.placas
DROP COLUMN IF EXISTS metros_cuadrados_iniciales;

ALTER TABLE public.placas
DROP COLUMN IF EXISTS metros_cuadrados_sobrantes;

-- 2. Añadir columna de cantidad de placas (entero, default 0)
ALTER TABLE public.placas
ADD COLUMN IF NOT EXISTS cantidad_placas integer DEFAULT 0 NOT NULL;

-- 3. Permitir que grosor sea NULL (campo opcional)
ALTER TABLE public.placas
ALTER COLUMN grosor DROP NOT NULL;
