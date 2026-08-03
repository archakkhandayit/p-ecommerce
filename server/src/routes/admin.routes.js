const express = require("express");
const router = express.Router();

const { getDashboardStats } = require("../controllers/admin.controller");
const authenticate = require("../middlewares/authenticate.middleware.js");
const authorize = require("../middlewares/authorize.middleware.js");

router.get(
  "/dashboard",
  authenticate,
  authorize("admin"),
  getDashboardStats
);

module.exports = router;