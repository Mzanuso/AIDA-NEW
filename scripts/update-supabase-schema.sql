-- Script SQL per aggiungere colonne metadata alla tabella style_references
-- Esegui questo script nel SQL Editor di Supabase prima di eseguire la migrazione

-- Aggiungi colonne array se non esistono
ALTER TABLE style_references
  ADD COLUMN IF NOT EXISTS mood_tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS subjects TEXT[] DEFAULT '{}';

-- Aggiungi colonne JSONB se non esistono
ALTER TABLE style_references
  ADD COLUMN IF NOT EXISTS style_attributes JSONB,
  ADD COLUMN IF NOT EXISTS technical_specs JSONB,
  ADD COLUMN IF NOT EXISTS aesthetic_profile JSONB,
  ADD COLUMN IF NOT EXISTS midjourney_params JSONB;

-- Verifica colonne esistenti
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'style_references'
ORDER BY ordinal_position;
