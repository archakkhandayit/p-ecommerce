const express = require("express");
const upload = require("../middlewares/upload.middleware.js")

const{getPost, createPost, updatePost, deletePost, publishedPost} = require("../controllers/post.controller.js");

const authenticate = require("../middlewares/authenticate.middleware.js");
const authorize = require("../middlewares/authorize.middleware.js");

const router= express.Router();

router.get("/", getPost);
router.post("/", authenticate,authorize("admin"), upload.single('image'), createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);
router.patch("/:id/published", publishedPost);


module.exports= router