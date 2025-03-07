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
        console.log(`💬 Mensaje enviado a ${to}: ${text}`);
    } catch (error) {
        console.error('Error enviando mensaje:', error.message);
    }
};

// Registrar interacción en la base de datos
const registerInteraction = async (from, text, state) => {
    try {
        await db.query(
            `INSERT INTO interactions 
            (whatsapp_number, message_text, direction, state) 
            VALUES ($1, $2, $3, $4)`,
            [from, text, 'inbound', state]
        );
        console.log(`📝 Estado actualizado a "${state}" para ${from}`);
    } catch (error) {
        console.error('Error registrando interacción:', error.message);
    }
};

// Enviar menú principal
const sendMenu = async (user) => {
    const menu = `Hola ${user.name}! Elegí una opción:\n
    1️⃣ Soporte Tango\n
    2️⃣ Soporte Técnico\n
    3️⃣ Ventas`;
    
    await sendWhatsappResponse(user.whatsapp_number, menu);
};

// Verificación del webhook
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ Webhook verificado');
        res.status(200).send(challenge);
    } else {
        console.error('❌ Fallo en verificación');
        res.sendStatus(403);
    }
});

// Procesamiento de mensajes
app.post('/webhook', async (req, res) => {
    try {
        const entry = req.body?.entry?.[0];
        const changes = entry?.changes?.[0]?.value;
        
        if (!changes?.messages) {
            console.log('🔄 No hay mensajes nuevos');
            return res.sendStatus(200);
        }

        const message = changes.messages[0];
        const from = message.from;
        const text = (message.text?.body || '').trim();

        console.log(`📨 Mensaje recibido de ${from}: "${text}"`);

        // Obtener último estado
        const { rows: [lastInteraction] } = await db.query(
            `SELECT state FROM interactions 
            WHERE whatsapp_number = $1 
            ORDER BY created_at DESC 
            LIMIT 1`,
            [from]
        );
        const lastState = lastInteraction?.state || 'start';
        console.log(`🔍 Estado actual: ${lastState}`);

        // Manejar estado completado
        if (lastState === 'completed') {
            if (text.toLowerCase() === 'hola') {
                await registerInteraction(from, text, 'start');
                await sendMenu({ 
                    name: 'Usuario', 
                    whatsapp_number: from 
                });
            } else {
                await sendWhatsappResponse(from, 
                    '⚠️ Enviá "Hola" para comenzar una nueva solicitud');
            }
            return res.sendStatus(200);
        }

        // Verificar usuario registrado
        const { rows: [user] } = await db.query(
            `SELECT * FROM users 
            WHERE whatsapp_number = $1 
            LIMIT 1`,
            [from]
        );

        // Flujo para usuarios no registrados
        if (!user) {
            if (lastState === 'awaiting_registration') {
                const userInfo = text.split(',').map(i => i.trim());
                
                if (userInfo.length === 3) {
                    const [name, email, company] = userInfo;
                    await db.query(
                        `INSERT INTO users 
                        (name, email, whatsapp_number, company_name) 
                        VALUES ($1, $2, $3, $4)`,
                        [name, email, parseInt(from), company]
                    );
                    await registerInteraction(from, text, 'awaiting_category');
                    await sendMenu({ name, whatsapp_number: from });
                    return res.sendStatus(200);
                }
            }
            
            await registerInteraction(from, text, 'awaiting_registration');
            await sendWhatsappResponse(from, 
                'Hola, Soy Checho👋! Por favor envíame tu nombre, correo y empresa separados por comas (Ejemplo: Martin Malgor, martin@gmail.com, Servicios y Sistemas).');
            return res.sendStatus(200);
        }

        // Manejar selección de categoría
        if (lastState === 'awaiting_category') {
            const categories = { 
                '1': 'Soporte Tango', 
                '2': 'Soporte Técnico', 
                '3': 'Ventas' 
            };

            if (!categories[text]) {
                await sendWhatsappResponse(from, 
                    '🚫 Opción inválida. Elegí:\n1. Soporte Tango\n2. Soporte Técnico\n3. Ventas');
                return res.sendStatus(200);
            }

            await registerInteraction(from, categories[text], 'awaiting_description');
            await sendWhatsappResponse(from, 
                `✅ Elegiste: ${categories[text]}. ¡Contanos tu problema!`);
            return res.sendStatus(200);
        }

        // Creación de ticket
        if (lastState === 'awaiting_description') {
            const { rows: [lastInteraction] } = await db.query(
                `SELECT message_text FROM interactions 
                WHERE whatsapp_number = $1 
                ORDER BY created_at DESC 
                LIMIT 1`,
                [from]
            );

            try {
                const subject = await generateResponse(
                    `Generar título profesional para: "${text}"`
                );
                
                const ticketId = await createSpecificTicket(
                    lastInteraction.message_text,
                    user,
                    `${subject} - ${user.company_name}`,
                    text
                );

                await registerInteraction(from, text, 'completed');
                await sendWhatsappResponse(from,
                    `¡Gracias! 🎉 Ticket creado!\nID: ${ticketId}\n\n🔎 Puedes verificar el estado de tu ticket en:\nhttps://soporte.serviciosysistemas.com.ar/upload/login.php\n\n🛠 Usuario: Tu correo electrónico\n🔑 Contraseña temporal: 123456\n\n📩 Recibirás notificaciones por correo electrónico.`);
            } catch (error) {
                console.error('❌ Error creando ticket:', error);
                await registerInteraction(from, text, 'start');
                await sendWhatsappResponse(from, 
                    '😢 Error creando ticket. Empecemos de nuevo enviando "Hola"');
            }
            return res.sendStatus(200);
        }

        // Estado no manejado
        await registerInteraction(from, text, 'start');
        await sendWhatsappResponse(from, 
            '👋 ¡Bienvenido! Enviá "Hola" para comenzar');
        return res.sendStatus(200);

    } catch (error) {
        console.error('💥 Error crítico:', error);
        await sendWhatsappResponse(from, 
            '🔧 Error temporal. Por favor intentá nuevamente más tarde');
        return res.sendStatus(500);
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
