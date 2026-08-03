const Post = require("../model/post.model");
const cloudinary = require("../config/cloudinary")

const getPost = async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json({
      success: true,
      message: "Posts Fetched Successfully!!",
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const createPost = async (req, res) => {
  const { name, desc, category } = req.body;
  try {
    console.log("data coming", name, desc, category);
    console.log("image coming", req.file);

    const uploadImage = await cloudinary.uploader.upload(req.file.path, {
      folder: "post-managemnt/post",
      resource_type: "image"
    })
    console.log("uploaded", uploadImage)
    
    const newpost = await Post.create({
      name,
      desc,
      category,
      image: {
        public_id: uploadImage.public_id,
        url: uploadImage.url
      }
    });
    res.status(201).json({
      success: true,
      message: "Post Created Successfully!!",
      data: newpost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updatePost = (req, res) => {};
const deletePost = (req, res) => {};
const publishedPost = (req, res) => {};

module.exports = {
  getPost,
  createPost,
  updatePost,
  deletePost,
  publishedPost,
};
