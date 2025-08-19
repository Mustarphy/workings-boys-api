import express from "express";
import { deductStars, getPaymentHistory, getUserStars, handleWebhook, initializePayment, verifyPayment } from "../controllers/payment.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Initialize payment for star purchase
router.post("/initialize", verifyToken, initializePayment);

//verify payment and add stars to user account
router.post("/verify", verifyToken, verifyPayment);

//paystack webhook (no auth required)
router.post("/webhook", handleWebhook);

// Get user's current star balance
router.get("/stars", verifyToken, getUserStars);

// Deduct stars for receipt generation
router.post("/deduct-stars", verifyToken, deductStars);

// Get user's payment history
router.get("/history", verifyToken, getPaymentHistory)

export default router;