const axios = require('axios');


// Función para crear un ticket genérico
const createTicket = async (ticketData) => {
    try {
        const defaultData = {
            alert: true,
            autorespond: true,
            source: 'API',
            ip: '192.168.85.129', // IP fija para el sistema
        };

        // Combina los datos por defecto con los datos específicos del ticket
        const payload = {
            ...defaultData,
            ...ticketData,
        };

        // Realiza la solicitud a la API de OSTicket
        const response = await axios.post(
            'http://192.168.85.129/osticket/upload/api/tickets.json',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': 'cambialawacho', // API Key
                },
            }
        );

        console.log('Ticket creado con éxito:', response.data);
        return response.data; // Devuelve el ID del ticket creado
    } catch (error) {
        console.error('Error creando el ticket:', error.response?.data || error.message);
        throw new Error('Error al crear el ticket');
    }
};

// Función para crear un ticket basado en categoría y datos del usuario
const createSpecificTicket = async (category, userData, subject, message) => {
    // Definición de categorías e IDs (topicId)
    const categories = {
        'Soporte Tango': 10,
        'Soporte Técnico': 1,
        'Ventas': 2,
    };

    // Validar que la categoría exista
    if (!categories[category]) {
        throw new Error(`La categoría "${category}" no es válida.`);
    }

    // Preparar los datos específicos del ticket
    const ticketData = {
        topicId: categories[category], // ID de la categoría
        name: userData.name, // Nombre del cliente
        email: userData.email, // Email del cliente
        phone: userData.phone || '', // Teléfono del cliente (opcional)
        subject: subject, // Asunto del ticket
        message: `data:text/html,<p>${message}</p>`, // Mensaje en formato HTML
    };

    // Llamar a la función de creación genérica
    return await createTicket(ticketData);
};

// Exportar las funciones para que puedan ser utilizadas en otros módulos
module.exports = {
    createSpecificTicket,
};