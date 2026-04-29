const prisma = require('../config/db');

const getDailyFinanceReport = async (req, res) => {
  try {
    // Get all payments created today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const payments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: startOfDay },
      },
    });

    // Reduce data into categories
    const report = payments.reduce((acc, p) => {
      const m = p.method.toLowerCase();
      acc[m] = (acc[m] || 0) + p.amount;
      acc.total += p.amount;
      return acc;
    }, { cash: 0, transfer: 0, pos: 0, online: 0, total: 0 });

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate report" });
  }
};

module.exports = {
  getDailyFinanceReport,
};