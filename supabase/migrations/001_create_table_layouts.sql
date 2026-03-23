-- Crear tabla para guardar las posiciones de las mesas en el modelo 3D
CREATE TABLE IF NOT EXISTS table_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  position_x REAL NOT NULL DEFAULT 0,
  position_y REAL NOT NULL DEFAULT 0,
  position_z REAL NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para búsquedas por restaurante
CREATE INDEX IF NOT EXISTS idx_table_layouts_restaurant_id ON table_layouts(restaurant_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_table_layouts_updated_at ON table_layouts;
CREATE TRIGGER update_table_layouts_updated_at
  BEFORE UPDATE ON table_layouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE table_layouts ENABLE ROW LEVEL SECURITY;

-- Política: cualquiera puede leer
CREATE POLICY "Anyone can read table_layouts" ON table_layouts
  FOR SELECT USING (true);

-- Política: solo service role puede escribir (las operaciones se hacen desde el backend)
CREATE POLICY "Service role can insert table_layouts" ON table_layouts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update table_layouts" ON table_layouts
  FOR UPDATE USING (true);

CREATE POLICY "Service role can delete table_layouts" ON table_layouts
  FOR DELETE USING (true);
