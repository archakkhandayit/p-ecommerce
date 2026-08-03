const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload.middleware.js")
const authenticate = require("../middlewares/authenticate.middleware.js");
const authorize = require("../middlewares/authorize.middleware.js");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller.js");

// Public
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin
router.post("/", authenticate, authorize("admin"), upload.single("image"), createProduct);
router.put("/:id", authenticate, authorize("admin"), upload.single("image"), updateProduct);
router.delete("/:id", authenticate, authorize("admin"), deleteProduct);

module.exports = router;

