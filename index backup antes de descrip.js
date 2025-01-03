require('dotenv').config();
const express = require('express');
const supabase = require('./supabase');
const { sendMessageWhatsapp } = require('./whatsapp');
const { createSpecificTicket } = require('./osticket');
const { generateResponse } = require('./openai');

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
    await sendMessageWhatsapp(response);
};

// Función para registrar una interacción en la base de datos
const registerInteraction = async (from, text, state) => {
    const { error } = await supabase.from('interactions').insert([
        {
            whatsapp_number: from,
            message_text: text,
            direction: 'inbound',
            state: state,
        },
    ]);

    if (error) {
        console.error('Error registrando interacción:', error);
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
            return res.sendStatus(200);
        }

        console.log(`Mensaje recibido de ${from}: ${text}`);

        // Consultar el último estado del usuario
        const { data: lastInteraction, error: interactionError } = await supabase
            .from('interactions')
            .select('*')
            .eq('whatsapp_number', from)
            .order('created_at', { ascending: false })
            .limit(1);

        if (interactionError) {
            console.error('Error obteniendo última interacción:', interactionError);
        }

        const lastState = lastInteraction?.[0]?.state || 'start';
        console.log(`Último estado del usuario: ${lastState}`);

        // Verificar si el usuario está registrado
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('whatsapp_number', from)
            .single();

        if (userError || !user) {
            // Solicitar datos de registro si no está registrado
            const userInfo = text.split(',').map((item) => item.trim());
            if (userInfo.length === 3) {
                const [name, email, companyName] = userInfo;

                const { error: insertError } = await supabase.from('users').insert([
                    { name, email, whatsapp_number: from, company_name: companyName },
                ]);

                if (insertError) {
                    console.error('Error registrando usuario:', insertError);
                    await sendWhatsappResponse(
                        from,
                        'Lo siento, no pudimos registrar tus datos. Por favor, intenta más tarde.'
                    );
                    return res.sendStatus(500);
                }

                await registerInteraction(from, text, 'awaiting_category');

                await sendWhatsappResponse(
                    from,
                    `Gracias por registrarte! Ahora selecciona el tema de ayuda que necesitas:
1️⃣ Soporte Tango
2️⃣ Soporte Técnico
3️⃣ Ventas`
                );
                return res.sendStatus(200);
            }

            // Si el mensaje no tiene los datos necesarios para el registro
            await registerInteraction(from, text, 'awaiting_registration');

            await sendWhatsappResponse(
                from,
                'Hola, Soy Checho! Por favor envíame tu nombre, correo y empresa separados por comas (Ejemplo: Juan Perez, juan@correo.com, Mi Empresa).'
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
                    `Elige un tema válido:
1️⃣ Soporte Tango
2️⃣ Soporte Técnico
3️⃣ Ventas`
                );
                return res.sendStatus(200);
            }

            const selectedCategory = categories[text];
            await registerInteraction(from, selectedCategory, 'awaiting_description');

            await sendWhatsappResponse(
                from,
                `Seleccionaste: ${selectedCategory}. Por favor describe tu problema.`
            );
            return res.sendStatus(200);
        }

        if (lastState === 'awaiting_description') {
            const selectedCategory = lastInteraction[0].message_text;

            try {
                console.log(`Procesando descripción del problema: ${text}`);
                const subject = await generateResponse(`Genera un título profesional para este problema: ${text}`);
                console.log(`Título generado por OpenAI: ${subject}`);

                const ticketId = await createSpecificTicket(
                    selectedCategory,
                    { name: user.name, email: user.email, phone: user.whatsapp_number },
                    subject,
                    text
                );

                await sendWhatsappResponse(
                    from,
                    `¡Gracias! Tu ticket ha sido creado exitosamente. El ID es: ${ticketId}. Nos pondremos en contacto contigo pronto.`
                );

                await registerInteraction(from, text, 'completed');
            } catch (ticketError) {
                console.error('Error creando ticket:', ticketError);
                await sendWhatsappResponse(
                    from,
                    'Lo siento, no pudimos procesar tu solicitud. Por favor, intenta más tarde.'
                );
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
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});