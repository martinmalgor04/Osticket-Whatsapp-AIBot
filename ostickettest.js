const fs = require('fs');
const path = require('path');

// Función para guardar el JSON en un archivo en lugar de enviarlo a la API
const createTicket = async (ticketData) => {
    try {
        const defaultData = {
            alert: true,
            autorespond: true,
            source: 'API',
            ip: '201.235.71.6', // IP fija para el sistema
        };

        // Combina los datos por defecto con los datos específicos del ticket
        const payload = {
            ...defaultData,
            ...ticketData,
        };

        // Especificar la ruta del archivo donde se guardará el JSON
        const filePath = path.join(__dirname, 'ticket_output.json');

        // Leer el archivo existente o inicializar con un array vacío
        let existingData = [];
        if (fs.existsSync(filePath)) {
            existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        // Agregar el nuevo ticket al archivo
        existingData.push(payload);

        // Escribir los datos en el archivo
        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');

        console.log('Ticket almacenado en ticket_output.json');
        return `mock_ticket_id_${Math.floor(Math.random() * 10000)}`; // Retornar un ID ficticio
    } catch (error) {
        console.error('Error guardando el ticket en JSON:', error);
        throw new Error('Error al guardar el ticket');
    }
};

// Función para crear un ticket basado en categoría y datos del usuario
const createSpecificTicket = async (topicId, userData, subject, message) => {
    // Definición de categorías e IDs (topicId)
    const categories = {
        'Soporte Tango': 10,
        'Soporte Técnico': 1,
        'Ventas': 2,
    };

    // Validar que la categoría exista
    if (!categories[topicId]) {
        throw new Error(`La categoría "${topicId}" no es válida.`);
    }

    // Preparar los datos específicos del ticket
    const ticketData = {
        topicId: categories[topicId], // ID de la categoría
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