const request = require("request");

// Función personalizada para crear un ticket
const createTicketWithPhone = (settings, formData, callback) => {
    const requestData = {
        alert: settings.ALERT,
        autorespond: settings.AUTO_RESPOND,
        source: "API",
        name: formData.name,
        email: formData.email,
        phone: formData.phone, // Agregar número de teléfono
        subject: formData.subject,
        message: `data:text/html,${formData.message}`, // Mensaje en formato HTML
        topicId: formData.topicId, // ID del tema
    };

    request.post(
        {
            url: settings.INSTALL_URL_PATH + "/api/http.php/tickets.json",
            json: true,
            headers: {
                "X-API-Key": settings.API_KEY,
            },
            body: requestData,
        },
        (error, response, body) => {
            if (!error && response.statusCode === 201) {
                callback(null, body);
            } else {
                callback(error || body, null);
            }
        }
    );
};

// Configuración para la prueba
const settings = {
    API_KEY: "3D298CFE9C8012CB000830CCFCECB405", // Clave API de OSTicket
    INSTALL_URL_PATH: "http://192.168.85.129/osticket/upload", // URL de tu servidor OSTicket
    ALERT: true, // Enviar alertas
    AUTO_RESPOND: true, // Respuestas automáticas
};

// Datos del ticket para la prueba
const ticketData = {
    name: "Martin Malgor", // Nombre del cliente
    email: "martin@servicios.com", // Correo del cliente
    phone: "5493795040635", // Número de teléfono del cliente
    subject: "Prueba de integración de ticket", // Asunto del ticket
    message: "Este es un mensaje de prueba para verificar la integración con OSTicket.", // Mensaje detallado
    topicId: 10, // ID del tema
};

// Crear un ticket de prueba
createTicketWithPhone(settings, ticketData, (err, ticketId) => {
    if (!err) {
        console.log("Ticket creado con éxito. ID del Ticket:", ticketId);
    } else {
        console.error("Error creando el ticket:", err);
    }
});