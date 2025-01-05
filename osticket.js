const osTicketAPI = require('osticket-nodejs-api-wrapper');

// Función para crear un ticket específico
const createSpecificTicket = async (category, userData, subject, message) => {
    // Definición de categorías e IDs (topicId)
    const categories = {
        'Soporte Tango': 10,
        'Soporte Técnico': 1,
        'Ventas': 2,
    };

    // Validar que la categoría exista
    if (!categories[category]) {
        throw new Error('La categoría "${category}" no es válida.');
    }

    // Preparar los datos del ticket
    const formData = {
        name: userData.name, // Nombre del cliente
        email: userData.email, // Correo electrónico
        subject: subject, // Asunto
        message: message, // Descripción
        topicId: categories[category], // ID de la categoría
    };

    // Configuración de la API
    const apiConfig = {
        API_KEY: process.env.OSTICKET_API_KEY, // Clave de API desde .env
        INSTALL_URL_PATH: process.env.OSTICKET_URL, // URL de instalación desde .env
        ALERT: true, // Alertar al cliente
        AUTO_RESPOND: true, // Respuesta automática al cliente
    };

    return new Promise((resolve, reject) => {
        // Llamada a la API de osTicket
        osTicketAPI(apiConfig, formData, (err, osTicketId) => {
            if (err) {
                console.error('Error creando el ticket:', err);
                reject(new Error('Error creando el ticket'));
            } else {
                console.log('Ticket creado con éxito. ID:', osTicketId);
                resolve(osTicketId);
            }
        });
    });
};

// Exportar la función para usarla en otros archivos
module.exports = {
    createSpecificTicket,
};