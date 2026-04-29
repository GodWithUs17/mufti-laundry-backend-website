const prisma = require('../config/db');

const recordPayment = async (req, res) => {
  const { orderId } = req.params;
  const { amount, method, reference, receivedById } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the payment log entry
      const payment = await tx.payment.create({
        data: {
          orderId,
          amount: parseFloat(amount),
          method, // Will use your PaymentType Enum (CASH, TRANSFER, etc.)
          reference,
          receivedById,
        },
      });

      // 2. Fetch the order to see current balance
      const order = await tx.order.findUnique({ where: { id: orderId } });
      
      if (!order) throw new Error("Order not found");

      // 3. Calculate new total paid
      const newAmountPaid = order.amountPaid + parseFloat(amount);
      
      // 4. Determine Status (Logic: if paid >= total, it's PAID, else PARTIAL)
      let newStatus = 'PARTIAL';
      if (newAmountPaid >= order.totalAmount) {
        newStatus = 'PAID';
      }

      // 5. Update the Order record
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          amountPaid: newAmountPaid,
          paymentStatus: newStatus,
          isPaid: newStatus === 'PAID', // Syncs your existing boolean
        },
      });

      return { payment, updatedOrder };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  recordPayment,
};