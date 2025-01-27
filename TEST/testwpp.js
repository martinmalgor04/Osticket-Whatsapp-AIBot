require('dotenv').config();
const fetch = require('node-fetch'); // Asegúrate de tener instalado 'node-fetch'

// Función para enviar mensajes a través de la API de WhatsApp
const sendMessageWhatsapp = async (message) => {
    const url = `https://graph.facebook.com/v22.0/578132638706772/messages`;
    const token = process.env.WHATSAPP_ACCESS_TOKEN || 'EAAQj6czhqhQBO5uZAzvDoE1GXJSksfkCG0Cq5ZAZBVqfAd8vs5OYXNtlZCQosnm0TiAYpq7cuozk17n5Iw8foSHW1a1AdnZCHMIU7FinBnfhj0Hcy0NccZCkjOfXJpwMXkTIZBikJZCph6DMUZCBlahrEtfKUZACVhtkFuc4cEGUlLOmydObgXF6UMIeZB4fjNZCQVob2QumTZBa5pweGtGJQpAHb9Uvt';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Error en la API: ${JSON.stringify(error)}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
        throw error;
    }
};

// Configuración del mensaje de texto simple
const testMessage = {
    messaging_product: 'whatsapp',
    to: '5493795040635', // Número en formato internacional
    type: 'text',
    text: {
        body: 'Hola 👋, Soy Checho! Tu asistente de Tickets de Servicios & Sistemas. Este es un mensaje de prueba de tu bot de WhatsApp.',
    },
};

// Enviar el mensaje de prueba y manejar errores
(async () => {
    try {
        const response = await sendMessageWhatsapp(testMessage);
        console.log('Mensaje enviado exitosamente:', response);
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
    }
})();