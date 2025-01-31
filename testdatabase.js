const { query } = require('./src/services/database');

async function testDB() {
    try {
        const res = await query('SELECT * FROM interactions');
        console.log('Conexión exitosa:', res.rows);
    } catch (err) {
        console.error('Error conectando a PostgreSQL:', err);
    }
}

testDB();