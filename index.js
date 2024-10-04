const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Crear el servidor HTTP
const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        // Servir el archivo HTML
        fs.readFile(path.join(__dirname, 'index.html'), 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500);
                return res.end('Error al cargar el archivo HTML');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

// Configurar CORS para Socket.IO
const io = socketIo(server, {
    cors: {
        origin: '*', // Permitir todos los orígenes
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    }
});

// Manejar conexiones de Socket.IO
io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado: ' + socket.id);

    // Manejar la suscripción a un canal
    socket.on('subscribe', (channel) => {
        socket.join(channel);
        console.log(`Usuario ${socket.id} se ha suscrito al canal: ${channel}`);
    });

    // Manejar desconexiones
    socket.on('disconnect', () => {
        console.log('Usuario desconectado: ' + socket.id);
    });
});

// Función para enviar una notificación a un canal específico
function sendNotification(channel, event, message) {
    console.log(`Enviando notificación al canal ${channel}:`, message);
    // Emitir la notificación al canal específico
    io.to(channel).emit(event, message);
}

// Configurar readline para recibir entrada de consola
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Función para pedir al usuario que ingrese un mensaje
function promptForNotification() {
    rl.question('Ingrese el canal (ejemplo: notificationsescuela11): ', (channel) => {
        rl.question('Ingrese el evento (ejemplo: notification): ', (event) => {
            rl.question('Ingrese el mensaje: ', (message) => {
                sendNotification(channel, event, { message });
                promptForNotification(); // Volver a pedir otro mensaje
            });
        });
    });
}

// Iniciar el prompt para el envío de notificaciones
promptForNotification();

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
