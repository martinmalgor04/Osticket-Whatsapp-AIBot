const osTicketAPI = require('osticket-nodejs-api-wrapper');

/**
 * Crear un ticket en OSTicket utilizando la API
 * @param {string} nameUser Nombre del cliente
 * @param {string} mailUser Correo del cliente
 * @param {string} subjectUser Asunto del ticket
 * @param {string} messageUser Mensaje detallado del ticket
 * @param {string} topicIdUser ID o nombre del tema en OSTicket
 */
function createTicket(nameUser, mailUser, subjectUser, messageUser, topicIdUser) {
    // Datos del ticket
    const formData = {
        name: nameUser,
        email: mailUser,
        subject: subjectUser,
        message: messageUser,
        topicId: topicIdUser,
    };

    // Configuración de la API
    osTicketAPI(
        {
            API_KEY: '734697C8A806BEBD1EA38E215A8BC81C', // Clave API
            INSTALL_URL_PATH: 'http://192.168.85.129/osticket/upload', // URL de OSTicket
            ALERT: true, // Enviar alertas
            AUTO_RESPOND: true, // Respuestas automáticas
        },
        formData,
        function (err, osTicketId) {
            if (!err) {
                console.log('Your osTicket Support Ticket ID #', osTicketId);
            } else {
                console.error('Error creating support ticket!', err);
            }
        }
    );
}

// Prueba para crear un ticket
createTicket(
    'Martin Malgor', // Nombre del cliente
    'martin@serviciosysistemas.com.ar', // Correo del cliente
    'Prueba API', // Asunto
    'Probando API WhatsApp', // Mensaje
    'Soporte Tango' // Tema
);