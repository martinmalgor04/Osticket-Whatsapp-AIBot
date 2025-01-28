const request = require('request');

// Función para crear un ticket específico
const createSpecificTicket = async (category, userData, subject, message) => {
    // Definición de categorías e IDs (topicId)
    const categories = {
        'Soporte Tango': 1,
        'Soporte Técnico': 10,
        'Ventas': 2,
    };

    // Validar que la categoría exista
    if (!categories[category]) {
        throw new Error(`La categoría "${category}" no es válida.`);
    }

    // Configuración desde variables de entorno
    const settings = {
        API_KEY: process.env.OSTICKET_API_KEY,
        INSTALL_URL_PATH: process.env.OSTICKET_URL,
        ALERT: true,
        AUTO_RESPOND: true
    };

    // Preparar datos del ticket
    const formData = {
        alert: settings.ALERT,
        autorespond: settings.AUTO_RESPOND,
        source: 'API',
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        subject: subject,
        message: `data:text/html,${message}`,
        topicId: categories[category]
    };

    return new Promise((resolve, reject) => {
        request.post({
            url: `${settings.INSTALL_URL_PATH}/api/http.php/tickets.json`,
            headers: {
                'X-API-Key': settings.API_KEY
            },
            json: true,
            body: formData
        }, (error, response, body) => {
            if (error || response.statusCode !== 201) {
                console.error('Error al crear ticket:', error || body);
                reject(error || new Error('Error al crear ticket'));
                return;
            }
            console.log('Ticket creado exitosamente:', body);
            resolve(body);
        });
    });
};

module.exports = { createSpecificTicket };