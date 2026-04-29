require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 5000;

// Start the Server
app.listen(PORT, () => {
  console.log(`🚀 Server is flying on http://localhost:${PORT}`);
});

// Add this at the bottom of your main server file (e.g., app.js or server.js)
process.on('SIGINT', async () => {
    console.log("Shutting down gracefully...");
    await client.destroy(); // Closes the WhatsApp browser properly
    process.exit(0);
});