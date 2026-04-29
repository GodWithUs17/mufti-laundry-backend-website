// const prisma = require('../config/db');

// // GET ALL CATEGORIES
// const getCategories = async (req, res) => {
//   try {
//     const categories = await prisma.category.findMany({
//       orderBy: { name: 'asc' },
//     });
//     res.status(200).json(categories);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch categories" });
//   }
// };

// // CREATE CATEGORY
// const createCategory = async (req, res) => {
//   const { name } = req.body;
//   try {
//     const newCategory = await prisma.category.create({
//       data: { name }
//     });
//     res.status(201).json(newCategory);
//   } catch (error) {
//     res.status(400).json({ message: "Category already exists" });
//   }
// };

// module.exports = { getCategories, createCategory };

const prisma = require('../config/db');

// GET ALL CATEGORIES
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

// CREATE CATEGORY
const createCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const newCategory = await prisma.category.create({
      data: { name }
    });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: "Category already exists" });
  }
};

// UPDATE/EDIT CATEGORY
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name }
    });
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: "Update failed. Name might be taken." });
  }
};

// DELETE CATEGORY (The Safe Way)
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Check if services exist in this category
    const servicesCount = await prisma.service.count({
      where: { categoryId: id }
    });

    if (servicesCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete. This category contains ${servicesCount} services.` 
      });
    }

    // 2. Delete if empty
    await prisma.category.delete({
      where: { id }
    });

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category" });
  }
};

module.exports = { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
};