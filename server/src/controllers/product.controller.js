const fs = require("fs");

const Product = require("../model/product.model.js");
const cloudinary = require("../config/cloudinary.js");

// GET /api/products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: products,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// POST /api/products
const createProduct = async (req, res) => {
    const { name, desc, category, price, stock } = req.body;

    try {
        if (!name || !desc || !category || !price || !stock) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Product image is required",
            });
        }

        const uploadedImage = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: "product-management/products",
            resource_type: "image",
        });

        fs.unlinkSync(req.file.path);

        const product = await Product.create({
            name,
            desc,
            category,
            price,
            stock,
            image: {
                public_id: uploadedImage.public_id,
                url: uploadedImage.secure_url,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
    const { name, desc, category, price, stock } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        product.name = name || product.name;
        product.desc = desc || product.desc;
        product.category = category || product.category;
        product.price = price || product.price;
        product.stock = stock || product.stock;

        if (req.file) {
            await cloudinary.uploader.destroy(product.image.public_id);

            const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
                folder: "product-management/products",
                resource_type: "image",
            });

            fs.unlinkSync(req.file.path);

            product.image = {
                public_id: uploadedImage.public_id,
                url: uploadedImage.secure_url,
            };
        }

        await product.save();

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        await cloudinary.uploader.destroy(product.image.public_id);

        await product.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};