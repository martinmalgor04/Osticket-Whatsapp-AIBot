const osTicketAPI = require('osticket-nodejs-api-wrapper');

/**
 * Crear un ticket en OSTicket utilizando la API
 * @param {string} nameUser Nombre del cliente
 * @param {string} mailUser Correo del cliente
 * @param {string} subjectUser Asunto del ticket
 * @param {string} messageUser Mensaje detallado del ticket
 * @param {string} topicIdUser ID o nombre del tema en OSTicket
 * @param {number} usernumber Numero de telefono
 */
function createTicket(nameUser, mailUser, subjectUser, messageUser, topicIdUser, usernumber) {
    // Datos del ticket
    const formData = {
        name: nameUser,
        email: mailUser,
        subject: subjectUser,
        message: messageUser,
        topicId: topicIdUser,
        phone: usernumber,
    };

    // Configuración de la API
    osTicketAPI(
        {
            API_KEY: '3D298CFE9C8012CB000830CCFCECB405', // Clave API
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
    'martinmmalgor64232@gmail.com', // Correo del cliente
    'Prueba API', // Asunto
    'Probando API WhatsApp', // Mensaje
    1, // Tema
    5493795040635 //Numero
);