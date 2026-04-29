const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth' 
    }),
    puppeteer: {
        headless: true, 
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage', 
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ],
        protocolTimeout: 120000, 
    }
});

client.on('qr', (qr) => {
    console.log('--- SCAN THE QR CODE BELOW ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('🚀 MUFTI BOT: WhatsApp is connected!');
});

// --- THE FIX: GRACEFUL SHUTDOWN ---
// This ensures that when Nodemon restarts, the browser is closed properly
process.on('SIGINT', async () => {
    console.log('--- SHUTTING DOWN MUFTI BOT ---');
    try {
        await client.destroy();
    } catch (e) {
        console.error("Error during destroy:", e);
    }
    process.exit(0);
});

// client.initialize();

module.exports = client;