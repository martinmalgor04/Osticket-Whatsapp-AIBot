require('dotenv').config();
const { sendMessageWhatsapp } = require('./whatsapp'); // Importa la función de envío

const testMessage = {
    messaging_product: 'whatsapp',
    to: '5493795040635', // Cambia a tu número en formato internacional
    type: 'text',
    text: { body: 'Hola 👋, Soy Checho! Tu asistente de Tickets de Servicios & Sistemas. Este es un mensaje de prueba de tu bot de WhatsApp.' },
};

sendMessageWhatsapp(testMessage);