const { createClient } = require('@supabase/supabase-js');

// Crear el cliente de Supabase usando las variables de entorno
const supabase = createClient(
    process.env.SUPABASE_URL, // URL de tu proyecto Supabase
    process.env.SUPABASE_API_KEY // Clave API de tu proyecto Supabase
);

module.exports = supabase;