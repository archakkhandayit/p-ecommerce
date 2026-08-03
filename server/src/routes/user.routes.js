const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate.middleware.js");
const authorize = require("../middlewares/authorize.middleware.js");

const {
    getUsers,
    deleteUser,
} = require("../controllers/user.controller.js");

// Admin Routes
router.get(
    "/",
    authenticate,
    authorize("admin"),
    getUsers
);

router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    deleteUser
);

module.exports = router;