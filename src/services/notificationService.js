// const client = require('../config/Whatsapp');

// const sendStatusUpdate = async (order) => {
//     // 1. Check if client is initialized
//     if (!client || !client.info) {
//         console.error("❌ WhatsApp client is not fully ready yet.");
//         return;
//     }

//     try {
//         // 2. Clean and format the phone number
//         const cleanNumber = order.customerPhone ? order.customerPhone.replace(/\D/g, '') : '';
//         if (!cleanNumber) {
//             console.error("❌ Missing customer phone number.");
//             return;
//         }

//         const chatId = cleanNumber.startsWith('234') 
//             ? cleanNumber + "@c.us" 
//             : `234${cleanNumber.slice(-10)}@c.us`;

//         // 3. Robust Data Handling
//         const orderId = order.id || order._id || "unknown";
//         const shortId = order.trackingCode || (typeof orderId === 'string' ? orderId.slice(-6) : "ORDER");
        
//         // Ensure FRONTEND_URL doesn't end with a slash to avoid double slashes
//         const baseUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, "");
//         const invoiceUrl = `${baseUrl}/invoice/${shortId}`;

//         // ⚠️ DEFENSIVE: Handle amount formatting carefully
//         // Check for both camelCase and snake_case just in case
//         const rawAmount = order.totalAmount || order.total_amount || 0;
//         const formattedAmount = new Intl.NumberFormat('en-NG', {
//             style: 'currency',
//             currency: 'NGN',
//         }).format(Number(rawAmount));
        
//         const currentStatus = order.status ? order.status.toUpperCase() : '';
//         const customerName = order.customerName || 'Customer';

//         // DEBUG: If BILLED is failing, check this log in your terminal
//         console.log(`DEBUG: [${currentStatus}] Name: ${customerName}, Amount: ${rawAmount}, URL: ${invoiceUrl}`);

//         let message = `*Mufti Laundry Spot* 🧺\n\n`;

//         switch (currentStatus) {
//             case 'BILLED':
//                 message += `Hello ${customerName},\n` +
//                            `Your invoice for order *#${shortId}* is ready.\n` +
//                            `Total: *${formattedAmount}*\n\n` +
//                            `View & Pay here: ${invoiceUrl}`;
//                 break;

//             case 'PROCESSING': 
//                 message += `Hello ${customerName}, your order *#${shortId}* is now being processed and is officially in the works! 🧺✨`;
//                 break;      

//             case 'READY':
//                 message += `Great news ${customerName}! Your order *#${shortId}* is READY for pickup. ✨`;
//                 break;

//             case 'DELIVERED':
//                 message += `Order *#${shortId}* has been delivered. Thank you!`;
//                 break;

//             case 'PICKED_UP':
//                 message += `Hello ${customerName}, your laundry has been picked up! 🚚`;
//                 break;

//             default:
//                 console.log(`⚠️ No message template found for status: ${currentStatus}`);
//                 return;
//         }

//         // 4. Verification and Sending
//         // Wrapped in a sub-try/catch so isRegisteredUser issues don't crash the whole service
//         try {
//             const isRegistered = await client.isRegisteredUser(chatId);
//             if (isRegistered) {
//                 await client.sendMessage(chatId, message);
//                 console.log(`✅ Message sent to ${customerName} for status: ${currentStatus}`);
//             } else {
//                 console.error(`❌ Number ${chatId} is not registered on WhatsApp.`);
//             }
//         } catch (regErr) {
//             // Fallback: Try sending even if registration check fails
//             console.warn(`⚠️ Registration check failed for ${chatId}, attempting direct send...`);
//             await client.sendMessage(chatId, message);
//         }

//     } catch (err) {
//         console.error("❌ WhatsApp Automation Failed:", err.message);
//         // This will tell you exactly which line crashed
//         console.error(err.stack);
//     }
// };

// module.exports = { sendStatusUpdate };

const client = require('../config/Whatsapp');

const sendStatusUpdate = async (order) => {
    if (!client || !client.info) {
        console.error("❌ WhatsApp client is not fully ready yet.");
        return;
    }

    try {
        const cleanNumber = order.customerPhone ? order.customerPhone.replace(/\D/g, '') : '';
        if (!cleanNumber) {
            console.error("❌ Missing customer phone number.");
            return;
        }

        const chatId = cleanNumber.startsWith('234') 
            ? cleanNumber + "@c.us" 
            : `234${cleanNumber.slice(-10)}@c.us`;

        const orderId = order.id || order._id || "unknown";
        const shortId = order.trackingCode || (typeof orderId === 'string' ? orderId.slice(-6) : "ORDER");
        
        // 1. Setup Base URLs
        const baseUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, "");
        const invoiceUrl = `${baseUrl}/invoice/${shortId}`; // Keep original ID for invoice if needed
        
        // 2. CREATE THE TRACKING LINK
        // This matches the /track route we set up in App.jsx and the ?code logic in TrackOrder.jsx
        const trackingUrl = `${baseUrl}/track?code=${shortId}`;

        const rawAmount = order.totalAmount || order.total_amount || 0;
        const formattedAmount = new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(Number(rawAmount));
        
        const currentStatus = order.status ? order.status.toUpperCase() : '';
        const customerName = order.customerName || 'Customer';

        let message = `*Mufti Laundry Spot* 🧺\n\n`;

        // 3. Update Message Templates with the Tracking Link
        switch (currentStatus) {
            case 'BILLED':
                message += `Hello ${customerName},\n` +
                           `Your invoice for order *#${shortId}* is ready.\n` +
                           `Total: *${formattedAmount}*\n\n` +
                           `View & Pay: ${invoiceUrl}\n` +
                           `Track status: ${trackingUrl}`;
                break;

            case 'PROCESSING': 
                message += `Hello ${customerName}, your order *#${shortId}* is now being processed! 🧺✨\n\n` +
                           `Follow the progress live: ${trackingUrl}`;
                break;      

            case 'READY':
                message += `Great news ${customerName}! Your order *#${shortId}* is READY for pickup. ✨\n\n` +
                           `Check details: ${trackingUrl}`;
                break;

            case 'DELIVERED':
                message += `Order *#${shortId}* has been delivered. Thank you for choosing Mufti! 🚚`;
                break;

            case 'PICKED_UP':
                message += `Hello ${customerName}, your laundry has been picked up! 🚚\n\n` +
                           `Track it here: ${trackingUrl}`;
                break;

            default:
                console.log(`⚠️ No message template found for status: ${currentStatus}`);
                return;
        }

        // 4. Verification and Sending
        try {
            const isRegistered = await client.isRegisteredUser(chatId);
            if (isRegistered) {
                await client.sendMessage(chatId, message);
                console.log(`✅ Message sent to ${customerName} for status: ${currentStatus}`);
            } else {
                console.error(`❌ Number ${chatId} is not registered on WhatsApp.`);
            }
        } catch (regErr) {
            console.warn(`⚠️ Registration check failed for ${chatId}, attempting direct send...`);
            await client.sendMessage(chatId, message);
        }

    } catch (err) {
        console.error("❌ WhatsApp Automation Failed:", err.message);
    }
};

module.exports = { sendStatusUpdate };