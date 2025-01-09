const axios = require('axios');

// Datos del ticket
const ticketData = {
    "alert": true,
    "priority": 1,
    "autorespond": true,
    "source": "API",
    "topicId": 1,
    "name": "Test API",
    "email": "example@noemail.com",
    "phone": "1234567890",
    "subject": "Testing API #1",
    "message": "data:text/html,Testing API #1"
};

// Configuración de la API
const API_URL = "http://192.168.85.129/osticket/upload/api/tickets.json";
const API_KEY = "3D298CFE9C8012CB000830CCFCECB405";

// Función para enviar el ticket
const createTicket = async () => {
    try {
        const response = await axios.post(API_URL, ticketData, {
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": API_KEY
            }
        });

        console.log("Ticket creado con éxito:", response.data);
    } catch (error) {
        console.error("Error creando el ticket:", error.response?.data || error.message);
    }
};

// Ejecutar la función
createTicket();