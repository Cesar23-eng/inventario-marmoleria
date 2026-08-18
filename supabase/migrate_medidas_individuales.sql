-- ============================================================
-- MIGRACIÓN: Añadir medidas individuales por placa
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- Añadir columna JSONB para almacenar medidas individuales de cada placa
-- NULL = todas las placas miden igual (usa largo/ancho del registro)
-- Array JSON = cada placa tiene sus propias medidas [{largo, ancho}, ...]
ALTER TABLE public.placas
ADD COLUMN IF NOT EXISTS medidas_individuales jsonb DEFAULT NULL;
