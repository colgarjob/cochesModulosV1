// config.js - Configuración de Supabase
// Fuente única de verdad para las credenciales y URLs

// Configuración de Supabase (sustituir con tus credenciales reales)
// Obtén estos datos de: https://supabase.com/dashboard/projects
const SUPABASE_URL = 'https://gxdmycgutxbxbfoxlgda.supabase.co';  // <-- CAMBIAR
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4ZG15Y2d1dHhieGJmb3hsZ2RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTcwNzMsImV4cCI6MjA5NjU5MzA3M30.FqPbDtb53jItO8Y4HNd-s5tP9TgQ7Is8g2dV7Nwl5-s';  // <-- CAMBIAR

// Headers para las peticiones a Supabase
const SUPABASE_HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
};

// URLs base de la API REST de Supabase
const API_BASE = `${SUPABASE_URL}/rest/v1`;

// Tablas existentes (definidas en docs/database.md)
const TABLES = {
    COCHES: 'coches',
    MARCAS: 'marcas'
};

// Exportar para uso en otros módulos (ES Modules)
export { SUPABASE_URL, SUPABASE_KEY, SUPABASE_HEADERS, API_BASE, TABLES };