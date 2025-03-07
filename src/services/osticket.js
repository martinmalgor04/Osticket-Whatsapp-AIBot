const axios = require('axios');

const createSpecificTicket = async (category, userData, subject, message) => {
    const categories = {
        'Soporte Tango': 1,
        'Soporte Técnico': 10,
        'Ventas': 2,
    };

    if (!categories[category]) {
        throw new Error(`Categoría inválida: ${category}`);
    }

    const settings = {
        API_KEY: process.env.OSTICKET_API_KEY,
        INSTALL_URL_PATH: process.env.OSTICKET_URL,
        ALERT: true,
        AUTO_RESPOND: true
    };

    const formData = {
        alert: settings.ALERT,
        autorespond: settings.AUTO_RESPOND,
        source: 'API',
        name: userData.name,
        email: userData.email,
        phone: parseInt(userData.whatsapp_number) || 0,
        subject: subject,
        message: `data:text/html,${message}`,
        topicId: categories[category]
    };

    try {
        const response = await axios.post(
            `${settings.INSTALL_URL_PATH}/api/tickets.json`,
            formData,
            {
                headers: {
                    'X-API-Key': settings.API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Manejar respuesta de texto plano (ej: "123456")
        let ticketId = response.data.toString().trim();

        if (!ticketId) {
            throw new Error('La API respondió con un ID vacío');
        }

        console.log(`✅ Ticket creado. ID: ${ticketId}`);
        return ticketId;

    } catch (error) {
        console.error('❌ Error en la API:', {
            status: error.response?.status,
            data: error.response?.data,
            request: {
                url: `${settings.INSTALL_URL_PATH}/api/tickets.json`,
                payload: formData
            }
        });

        throw new Error(`Error al crear ticket: ${error.response?.data || error.message}`);
    }
};

module.exports = { createSpecificTicket };
