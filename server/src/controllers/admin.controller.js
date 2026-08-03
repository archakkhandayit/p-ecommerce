const User = require("../model/user.model.js");
const Product = require("../model/product.model.js");

const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalProducts] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Dashboard statistics fetched successfully",
      data: {
        totalUsers,
        totalProducts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};