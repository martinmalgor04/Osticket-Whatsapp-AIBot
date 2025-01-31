// Cargar módulos necesarios
require('dotenv').config();
const express = require('express');
const db = require('./services/database');
const { sendMessageWhatsapp } = require('./services/whatsapp');
const { createSpecificTicket } = require('./services/osticket');
const { generateResponse } = require('./services/openai');

const app = express();
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'mi-token-seguro';

app.use(express.json());

// Función para enviar mensajes de WhatsApp
const sendWhatsappResponse = async (to, text) => {
    const response = {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
    };

    try {
        await sendMessageWhatsapp(response);
    } catch (error) {
        console.error('Error enviando mensaje de WhatsApp:', error.message);
    }
};

// Función para registrar una interacción en la base de datos
const registerInteraction = async (from, text, state) => {
    try {
        await db.query(
            'INSERT INTO interactions (whatsapp_number, message_text, direction, state) VALUES ($1, $2, $3, $4)',
            [from, text, 'inbound', state]
        );
    } catch (error) {
        console.error('Error registrando interacción en la base de datos:', error.message);
    }
};

// Ruta para verificar el webhook de Meta
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Webhook verificado correctamente');
        res.status(200).send(challenge);
    } else {
        console.error('Fallo en la verificación del webhook');
        res.sendStatus(403);
    }
});

// Ruta principal para procesar mensajes
app.post('/webhook', async (req, res) => {
    try {
        const entry = req.body?.entry?.[0];
        const changes = entry?.changes?.[0]?.value;

        if (!changes?.messages) {
            console.log('No hay mensajes para procesar.');
            return res.sendStatus(200);
        }

        const message = changes.messages[0];
        const from = message.from;
        const text = message.text?.body?.trim();

        if (!from || !text) {
            console.log('Mensaje inválido recibido.');
            await sendWhatsappResponse(from, 'Disculpe, solo puedo procesar mensajes de texto por el momento.');
            return res.sendStatus(200);
        }

        console.log('Mensaje recibido de ' + from + ': ' + text);

        // Obtener la última interacción del usuario
        const { rows: lastInteractions } = await db.query(
            'SELECT * FROM interactions WHERE whatsapp_number = $1 ORDER BY created_at DESC LIMIT 1',
            [from]
        );

        const lastState = lastInteractions.length > 0 ? lastInteractions[0].state : 'start';
        console.log('Último estado del usuario: ' + lastState);

        // Verificar si el usuario está registrado
        const { rows: users } = await db.query(
            'SELECT * FROM users WHERE whatsapp_number = $1 LIMIT 1',
            [from]
        );

        const user = users.length > 0 ? users[0] : null;

        if (lastState === 'completed') {
            console.log('Reiniciando flujo para nuevo ciclo de conversación.');

            if (!user) {
                await registerInteraction(from, text, 'start');
                await sendWhatsappResponse(
                    from,
                    'Hola, Soy Checho👋! Por favor envíame tu nombre, correo y empresa separados por comas (Ejemplo: Martin Malgor, martin@gmail.com, Servicios y Sistemas).'
                );
                return res.sendStatus(200);
            } else {
                await registerInteraction(from, text, 'awaiting_category');
                await sendWhatsappResponse(
                    from,
                    'Hola de nuevo, ' + user.name + '! Por favor selecciona el tema de ayuda que necesitas:\n1️⃣ Soporte Tango\n2️⃣ Soporte Técnico\n3️⃣ Ventas'
                );
                return res.sendStatus(200);
            }
        }

        if (!user) {
            const userInfo = text.split(',').map((item) => item.trim());

            if (userInfo.length === 3) {
                const [name, email, companyName] = userInfo;

                await db.query(
                    'INSERT INTO users (name, email, whatsapp_number, company_name) VALUES ($1, $2, $3, $4)',
                    [name, email, from, companyName]
                );

                await registerInteraction(from, text, 'awaiting_category');
                await sendWhatsappResponse(
                    from,
                    name + ' Gracias por registrarte! Ahora selecciona el tema de ayuda que necesitas:\n1️⃣ Soporte Tango\n2️⃣ Soporte Técnico\n3️⃣ Ventas'
                );
                return res.sendStatus(200);
            }

            await registerInteraction(from, text, 'awaiting_registration');
            await sendWhatsappResponse(
                from,
                'Hola, Soy Checho👋! Por favor envíame tu nombre, correo y empresa separados por comas (Ejemplo: Juan Perez, juan@correo.com, Mi Empresa).'
            );
            return res.sendStatus(200);
        }

        const categories = {
            '1': 'Soporte Tango',
            '2': 'Soporte Técnico',
            '3': 'Ventas',
        };

        if (lastState === 'start' || lastState === 'awaiting_category') {
            if (!categories[text]) {
                await registerInteraction(from, text, 'awaiting_category');
                await sendWhatsappResponse(
                    from,
                    user.name + ' Elige un tema de soporte:\n1️⃣ Soporte Tango\n2️⃣ Soporte Técnico\n3️⃣ Ventas'
                );
                return res.sendStatus(200);
            }

            await registerInteraction(from, categories[text], 'awaiting_description');
            await sendWhatsappResponse(from, 'Seleccionaste: ' + categories[text] + '. Por favor describe tu problema.');
            return res.sendStatus(200);
        }

        if (lastState === 'awaiting_description') {
            const selectedCategory = lastInteractions[0].message_text;

            try {
                console.log('Procesando descripción del problema: ' + text);
                const prompt = 'Genera un título profesional y breve para el siguiente problema: "' + text + '"';
                const subjectGenerated = await generateResponse(prompt);
                const subject = subjectGenerated + ' - ' + user.company_name;

                console.log('Título generado: ' + subject);
                const ticketId = await createSpecificTicket(selectedCategory, user, subject, text);

                await sendWhatsappResponse(
                    from,
                    '¡Gracias! Tu ticket ha sido creado exitosamente. ID: ' + ticketId + '.\n\n🔎 Puedes verificar el estado de tu ticket en:\nhttps://soporte.serviciosysistemas.com.ar/upload/login.php\n\n🛠 Usuario: Tu correo electrónico\n🔑 Contraseña temporal: 1234\n\n📩 Recibirás notificaciones por correo electrónico.'
                );

                await registerInteraction(from, text, 'completed');
            } catch (ticketError) {
                console.error('Error creando ticket:', ticketError);
                await sendWhatsappResponse(from, 'Lo siento, no pudimos procesar tu solicitud. Inténtalo más tarde.');
            }
            return res.sendStatus(200);
        }

        console.log('Estado inesperado. Verificar lógica.');
        return res.sendStatus(400);
    } catch (error) {
        console.error('Error procesando webhook:', error);
        res.sendStatus(500);
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log('Servidor corriendo en http://localhost:' + PORT);
});