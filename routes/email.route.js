import express from "express"
import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config();
const router = express.Router();


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

router.post("/send-receipt", async (req, res) => {
    const { email, amount, currency, wallet } = req.body;


    const htmlContent = `
  <div style="max-width:600px;margin:auto;background:#fff;border:1px solid #ddd;font-family:'Helvetica Neue',Arial,sans-serif;">
    <div style="background:#FCD535;padding:20px;text-align:center;">
      <img src="https://upload.wikimedia.org/wikipedia/commons/5/57/Binance_Logo.png" alt="Binance Logo" style="height:40px;">
    </div>
    <div style="padding:30px;">
      <h2 style="color:#1E2329;margin-bottom:10px;">Deposit Receipt</h2>
      <p style="color:#4D4D4D;margin:0 0 20px;">Your deposit has been successfully received.</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr><td style="padding:8px 0;color:#999;">Amount</td><td style="text-align:right;color:#333;"><strong>$${amount}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#999;">Currency</td><td style="text-align:right;color:#333;">${currency}</td></tr>
        <tr><td style="padding:8px 0;color:#999;">Wallet Address</td><td style="text-align:right;color:#333;">${wallet}</td></tr>
        <tr><td style="padding:8px 0;color:#999;">Status</td><td style="text-align:right;color:#28a745;"><strong>Confirmed</strong></td></tr>
        <tr><td style="padding:8px 0;color:#999;">Date</td><td style="text-align:right;color:#333;">${new Date().toLocaleDateString()}</td></tr>
      </table>
      <p style="font-size:13px;color:#999;">Thank you for using Binance. This receipt is for your records.</p>
    </div>
    <div style="background:#f9f9f9;text-align:center;padding:15px;font-size:12px;color:#999;">
      © 2025 Binance, All rights reserved.
    </div>
  </div>
  `;

  try {
    await transporter.sendMail({
        from: `"Binance Receipts" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Deposit Receipt",
        html: htmlContent,
    });

    res.status(200).json({message: "Receipt sent successfully!"});
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({message: "Failed to send receipt."});
  }

});

export default router