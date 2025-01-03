const axios = require('axios');

// Función para enviar mensajes usando la API de WhatsApp
async function sendMessageWhatsapp(data) {
    if (!process.env.WHATSAPP_PHONE_ID || !process.env.WHATSAPP_API_KEY) {
        throw new Error('Las variables de entorno WHATSAPP_PHONE_ID y WHATSAPP_API_KEY son obligatorias');
    }

    try {
        const response = await axios.post(
            `https://graph.facebook.com/v15.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.WHATSAPP_API_KEY}`,
                },
            }
        );
        console.log('Mensaje enviado:', response.data);
        return response.data; // Devuelve la respuesta
    } catch (error) {
        console.error('Error enviando mensaje:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error?.message || error.message); // Lanza el error
    }
}

// Exportar la función para que pueda ser utilizada en otros archivos
module.exports = { sendMessageWhatsapp };