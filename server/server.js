require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const connectDB = require("./src/config/db.js")

const PORT = 5000;

const productRouter = require("./src/routes/product.routes.js")
const authRouter = require("./src/routes/auth.routes.js");
const userRouter = require("./src/routes/user.routes.js");
const postRouter = require("./src/routes/post.routes.js");
const adminRouter = require("./src/routes/admin.routes");


const main = async () => {
    await connectDB();

    app.use(cors({
        // origin: 'http://localhost:5173',
        methods: ["POST", "GET", "PUT", "DELETE", "PATCH"],
        credentials: true
    }))

    app.use(express.json());
    app.use(express.urlencoded({ extended: false}))

    app.get("/", (req, res) => res.json({ status: "OK", health: "healthy" }))

    app.use("/api/products", productRouter);
    app.use("/api/auth", authRouter);
    app.use("/api/users", userRouter);
    app.use("/api/posts", postRouter);
    app.use("/api/admin", adminRouter);

    app.listen(PORT, (req, res) => {
        console.log(`App running on port: ${PORT}`);
        console.log(`http://localhost:${PORT}`);
    })
}

main();