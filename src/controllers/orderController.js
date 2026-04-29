const prisma = require('../config/db');
const { sendStatusUpdate } = require('../services/notificationService');

const createOrder = async (req, res) => {
  try {
    const { 
      customerName, 
      customerPhone, 
      address, 
      pickupDate, 
      pickupSlot, 
      pickupNotes,
      processingNotes, // Added
      items, 
      applyHandlingFee = true 
    } = req.body;

    const handlingFee = applyHandlingFee ? 200 : 0;
    const subtotal = items ? items.reduce((sum, item) => sum + (item.price * item.qty), 0) : 0;
    const totalAmount = subtotal + handlingFee;

    const trackingCode = `MUFTI-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newOrder = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        address: address || "In-Shop",
        pickupDate: pickupDate ? new Date(pickupDate) : new Date(),
        pickupSlot: pickupSlot || "Instant",
        pickupNotes,
        processingNotes, // Added
        trackingCode,
        status: items && items.length > 0 ? 'BILLED' : 'REQUESTED',
        applyHandlingFee,
        handlingFeeAmount: handlingFee,
        subtotal,
        totalAmount,
        items: {
          create: items?.map(item => ({
            itemName: item.name,
            unitPrice: parseFloat(item.price),
            quantity: parseInt(item.qty),
            service: { connect: { id: item.id || item.serviceId } }
          })) || []
        }
      },
      include: { items: true }
    });

    await sendStatusUpdate(newOrder);

    res.status(201).json({ 
      success: true, 
      message: "Order created successfully!", 
      order: newOrder 
    });

  } catch (error) {
    console.error("Creation Error:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, driverId } = req.body;

  try {
    // Logic to automatically track processing time
    let timeUpdates = {};
    if (status === 'PROCESSING') timeUpdates.startedAt = new Date();
    if (status === 'READY') timeUpdates.completedAt = new Date();

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { 
        status,
        ...(driverId && { driverId }),
        ...timeUpdates // Automatically sets startedAt or completedAt
      }
    });

    sendStatusUpdate(updatedOrder);

    res.json({ message: `Order updated to ${status}`, updatedOrder });
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
};

const generateBill = async (req, res) => {
  const { id } = req.params; 
  const { items, applyHandlingFee, processingNotes } = req.body; // Destructured notes

  try {
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!currentOrder) return res.status(404).json({ error: "Order not found" });

    const subtotal = items.reduce((sum, item) => {
      return sum + (parseFloat(item.unitPrice) * parseInt(item.quantity));
    }, 0);
    
    const handlingFee = applyHandlingFee ? 200 : 0;
    const totalAmount = subtotal + handlingFee;

    const isNewBill = ['REQUESTED', 'PENDING'].includes(currentOrder.status);
    const newStatus = isNewBill ? 'BILLED' : currentOrder.status;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: newStatus,
        subtotal,
        handlingFeeAmount: handlingFee,
        applyHandlingFee,
        totalAmount,
        processingNotes, // Saved notes during billing
        items: {
          deleteMany: {}, 
          create: items.map(item => ({
            itemName: item.itemName,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            service: { connect: { id: item.serviceId } }
          }))
        }
      },
      include: { items: true }
    });

    if (isNewBill) {
      await sendStatusUpdate(updatedOrder);
    }

    res.status(200).json({
      message: isNewBill ? "Bill processed" : "Invoice updated",
      order: updatedOrder
    });

  } catch (error) {
    console.error("Billing Error:", error);
    res.status(500).json({ error: "Failed to process bill." });
  }
};

const assignOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { staffId } = req.body;

    if (!staffId) return res.status(400).json({ error: "Staff ID is required" });

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        staffId: staffId,
        status: 'PROCESSING',
        startedAt: new Date(), // Job officially starts when assigned
      },
      include: {
        staff: { select: { name: true, role: true } },
        items: true
      }
    });

    await sendStatusUpdate(updatedOrder);
    res.json(updatedOrder);
  } catch (error) {
    console.error("Assignment Error:", error);
    res.status(500).json({ error: "Assignment failed." });
  }
};

const trackOrder = async (req, res) => {
  const { code } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { trackingCode: code.toUpperCase() },
      select: {
        customerName: true,
        status: true,
        totalAmount: true,
        items: true,
        updatedAt: true,
        processingNotes: true // Added so customers can see special handling if needed
      }
    });
    if (!order) return res.status(404).json({ message: "Tracking code not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        items: true,
        staff: { select: { name: true } }
      }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

const getPublicInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { trackingCode: orderId },
          ...(orderId.length > 20 ? [{ id: orderId }] : [])
        ]
      },
      select: {
        id: true,
        trackingCode: true,
        customerName: true,
        customerPhone: true,
        status: true,
        totalAmount: true,
        subtotal: true,
        handlingFeeAmount: true,
        createdAt: true,
        processingNotes: true,
        items: {
          select: {
            itemName: true,
            quantity: true,
            unitPrice: true,
          }
        }
      }
    });

    if (!order) return res.status(404).json({ message: "Invoice not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
};

module.exports = { 
  createOrder,
  updateOrderStatus,
  trackOrder,
  assignOrder,
  generateBill,
  getAllOrders,
  getPublicInvoice
};