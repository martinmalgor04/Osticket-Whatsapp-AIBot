const supabase = require('./supabase'); // Importa el cliente de Supabase

async function testConnection() {
    try {
        const { data, error } = await supabase.from('users').select('*');
        if (error) {
            console.error('Error conectando a Supabase:', error);
        } else {
            console.log('Usuarios en la base de datos:', data);
        }
    } catch (err) {
        console.error('Error en la conexión:', err);
    }
}

testConnection();