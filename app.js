import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route.js";
import emailRoute from "./routes/email.route.js";
import withdrawRoutes from "./routes/withdraw.route.js";
import userRoutes from "./routes/user.route.js";
import paymentRoutes from "./routes/payment.route.js";


const app = express();

app.use(cors({origin: process.env.CLIENT_URL, credentials: true}));
app.use(express.json());
app.use(cookieParser())


app.use("/api/auth", authRoute);
app.use("/api/email", emailRoute);
app.use("/api/users", userRoutes);
app.use("/api/withdraw", withdrawRoutes);
app.use("/api/payment", paymentRoutes);

app.listen(8800, () => {
    console.log("Server is running on port 8800");
    });