const prisma = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    // 1. Fetch all orders to perform accurate financial math
    const allOrders = await prisma.order.findMany();

    // 2. Perform Calculations
    const stats = allOrders.reduce((acc, order) => {
      // Revenue is what has actually been paid
      acc.totalRevenue += (order.amountPaid || 0);
      
      // Outstanding is Total minus Paid (only if balance is positive)
      const balance = order.totalAmount - (order.amountPaid || 0);
      if (balance > 0) acc.unpaidBalance += balance;

      // Map Status Counts
      if (order.status === 'REQUESTED') acc.received++;
      if (order.status === 'PROCESSING') acc.activeWork++;
      if (order.status === 'READY') acc.readyOrders++;
      if (order.status === 'DELIVERED') acc.deliveredOrders++;

      return acc;
    }, { 
      totalRevenue: 0, 
      unpaidBalance: 0, 
      received: 0, 
      activeWork: 0, 
      readyOrders: 0, 
      deliveredOrders: 0 
    });

    // 3. Get recent orders with ALL necessary fields for the frontend
    const recentOrders = await prisma.order.findMany({
      take: 8, // Increased slightly for better dashboard fill
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        customerName: true,
        trackingCode: true, // Needed for the #CODE display
        totalAmount: true,
        amountPaid: true,   // Needed for the balance math in table
        status: true,
        paymentStatus: true, // CRITICAL: This is why your badges weren't changing
        createdAt: true
      }
    });

    res.json({
      stats,
      recentOrders
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getDashboardStats };