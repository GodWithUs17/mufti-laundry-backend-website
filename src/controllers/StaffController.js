const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

// 1. Get all staff (Filtered to exclude Admins and show only active/inactive staff)
const getAllStaff = async (req, res) => {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: { in: ['STAFF', 'DRIVER'] }
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true, // Crucial for the frontend toggle
        _count: {
          select: { 
            managedOrders: true, 
            deliveryTasks: true 
          }
        }
      }
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch staff" });
  }
};

// 2. Add new staff
const addStaff = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    // A. Check if user already exists (Good practice)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // B. HASH THE PASSWORD
    // Generate a 'salt' (extra security layer) and then hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newStaff = await prisma.user.create({
      data: { 
        name, 
        email, 
        role, 
        password: hashedPassword, // C. Save the HASH, not the plain text
        isActive: true 
      }
    });

    // Remove password from response for security
    const { password: _, ...staffWithoutPassword } = newStaff;
    res.status(201).json(staffWithoutPassword);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not add staff member" });
  }
};

// 3. Toggle Staff Status (Disable/Enable)
// This switches 'isActive' between true and false
const toggleStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, find the current status
    const currentStaff = await prisma.user.findUnique({ where: { id } });
    
    if (!currentStaff) return res.status(404).json({ error: "Staff not found" });

    // Flip the status
    const updatedStaff = await prisma.user.update({
      where: { id },
      data: { isActive: !currentStaff.isActive }
    });

    res.json({ 
      message: `Staff ${updatedStaff.isActive ? 'enabled' : 'disabled'}`, 
      isActive: updatedStaff.isActive 
    });
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
};

// 4. Delete Staff
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    // Prisma will throw an error if this staff is linked to orders
    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: "Staff deleted successfully" });
  } catch (error) {
    // If they have order history, suggest disabling instead
    res.status(400).json({ 
      error: "Cannot delete staff with order history. Use 'Disable' instead." 
    });
  }
};

module.exports = { 
  getAllStaff, 
  addStaff, 
  toggleStaffStatus, 
  deleteStaff 
};