const prisma = require('../config/db');

// 1. GET ALL SERVICES (With Category Data)
const getServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      include: { 
        category: true // This joins the category table so the frontend gets the name
      },
      orderBy: { name: 'asc' },
    });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch services", error: error.message });
  }
};

// 2. CREATE NEW SERVICE
const createService = async (req, res) => {
  const { name, price, categoryId } = req.body; // Changed 'category' to 'categoryId'
  try {
    const newService = await prisma.service.create({
      data: { 
        name, 
        price: parseFloat(price), 
        categoryId // Links to the Category ID from your dropdown
      },
      include: { category: true }
    });
    res.status(201).json(newService);
  } catch (error) {
    res.status(400).json({ message: "Failed to create service", error: error.message });
  }
};

// 3. UPDATE SERVICE (EDIT)
const updateService = async (req, res) => {
  const { id } = req.params;
  const { name, price, categoryId } = req.body;
  try {
    const updated = await prisma.service.update({
      where: { id },
      data: { 
        name, 
        price: parseFloat(price), 
        categoryId 
      },
      include: { category: true }
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// 4. DELETE SERVICE
const deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.service.delete({ where: { id } });
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Delete failed", error: error.message });
  }
};

module.exports = { getServices, createService, updateService, deleteService };