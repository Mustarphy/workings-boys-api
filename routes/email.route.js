import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import axios  from 'axios';

dotenv.config();
const router = express.Router();

// Define template functions
function binanceTemplate({ amount, currency, wallet }) {
  return `
  <div style="max-width:600px;margin:auto;background:#141414;border:1px solid #333;font-family:'Helvetica Neue',Arial,sans-serif;color:#fff;">
  <!-- Header with logo + BINANCE text -->
  <div style="background:#1E2329;padding:20px;text-align:center;">
    <div style="display:inline-flex;align-items:center;gap:8px;">
      <img src="https://upload.wikimedia.org/wikipedia/commons/5/57/Binance_Logo.png" alt="Binance Logo" style="height:32px;gap:3px;">
      <span style="color:#F0B90B;font-size:20px;font-weight:bold;font-family:Arial, sans-serif;line-height:2;">BINANCE</span>
    </div>
  </div>

  <!-- Main body -->
  <div style="padding:30px;">
    <h2 style="color:#F0B90B;margin-bottom:10px;">USDT Deposit Successful</h2>
    <p style="color:#ccc;margin:0 0 20px;">Your deposit of <strong>${amount} ${currency} </strong> is now available in your Binance account. Log in to check your balance. Read our <a href="#" style="color:#F0B90B;text-decoration:none;">FAQs</a> if you are running into problems.</p>

    <!-- Dashboard Button -->
    <div style="margin:20px 0;">
      <a href="#" style="background:#F0B90B;color:#000;padding:12px 24px;text-decoration:none;border-radius:4px;font-weight:bold;display:inline-block;">Visit Your Dashboard</a>
    </div>

    <!-- Help / Reset -->
    <p style="color:#aaa;font-size:14px;">Don’t recognize this activity? Please <a href="#" style="color:#F0B90B;">reset your password</a> and contact <a href="#" style="color:#F0B90B;">customer support</a> immediately.</p>

    <p style="color:#666;font-size:12px;margin-top:30px;font-style:italic;">This is an automated message, please do not reply.</p>
  </div>

  <!-- Footer -->
  <div style="background:#1E2329;text-align:center;padding:20px;font-size:12px;color:#999;">
    <p style="margin-bottom:10px;">Stay connected!</p>
    <div style="margin-bottom:10px;">
      <img src="https://img.icons8.com/ios-filled/20/ffffff/twitterx.png" alt="X" style="margin:0 6px;">
      <img src="https://img.icons8.com/ios-filled/20/ffffff/telegram-app.png" alt="Telegram" style="margin:0 6px;">
      <img src="https://img.icons8.com/ios-filled/20/ffffff/facebook-new.png" alt="Facebook" style="margin:0 6px;">
      <img src="https://img.icons8.com/ios-filled/20/ffffff/linkedin.png" alt="LinkedIn" style="margin:0 6px;">
      <img src="https://img.icons8.com/ios-filled/20/ffffff/youtube-play.png" alt="YouTube" style="margin:0 6px;">
      <img src="https://img.icons8.com/ios-filled/20/ffffff/reddit.png" alt="Reddit" style="margin:0 6px;">
      <img src="https://img.icons8.com/ios-filled/20/ffffff/instagram-new.png" alt="Instagram" style="margin:0 6px;">
    </div>
    <p style="margin:6px 0;">To stay secure, setup your phishing code <a href="#" style="color:#F0B90B;">here</a></p>
    <p style="font-size:11px;color:#777;line-height:1.5;">
      <strong>Risk warning:</strong> Cryptocurrency trading is subject to high market risk. Binance will make the best efforts to choose high-quality coins, but will not be responsible for your trading losses. Please trade with caution.<br>
      <strong>Kindly note:</strong> Please be aware of phishing sites and always make sure you are visiting the official Binance.com website when entering sensitive data.
    </p>
    <p style="margin-top:15px;color:#555;">© 2024 Binance.com, All Rights Reserved.</p>
  </div>
</div>
  `;
}

function coinbaseTemplate({ amount, currency, wallet, usdValue }) {
  return `
  <div style="max-width:600px;margin:auto;background:#ffffff;font-family:'Helvetica Neue',Arial,sans-serif;border:1px solid #e0e0e0;">
  <!-- Header -->
  <div style="background:#f5f8fb;padding:30px 20px;text-align:center;">
    <h1 style="color:#1652f0;font-size:28px;margin:0;">coinbase</h1>
  </div>

  <!-- Checkmark Icon -->
  <div style="text-align:center;padding:40px 20px 20px;">
    <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Check" style="width:72px;height:72px;">
  </div>

  <!-- Main Message -->
  <div style="text-align:center;padding:0 20px 20px;">
    <h2 style="color:#333;font-size:20px;margin-bottom:10px;">You just received</h2>
    <p style="color:#333;font-size:24px;margin:0;"><strong> ${amount} ${currency}</strong></p>
  </div>

  <!-- Description -->
  <div style="padding:0 30px 20px;color:#555;font-size:15px;line-height:1.6;">
    <p>You just received <strong>${amount} ${currency}</strong> (worth <strong>${usdValue} USD</strong>) from an external Bitcoin account. It may take up to 6 network confirmations before your Bitcoin is available to trade.</p>
  </div>

  <!-- CTA Button -->
  <div style="text-align:center;padding:20px;">
    <a href="#" style="background:#1652f0;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:4px;font-weight:bold;display:inline-block;font-size:15px;">
      Sign in to view transaction
    </a>
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding:20px;font-size:12px;color:#aaa;">
    <p>© 2025 Coinbase, Inc. All rights reserved.</p>
  </div>
</div>

  `;
}

function bybitTemplate({ amount, currency, wallet, }){
  return`
  <div style="margin:auto;background:#1A1A1A;color:#fff;font-family:Helvetica,Arial,sans-serif;border:1px solid #333;">
  <div style="padding-left:20px; padding-top:30px; background:#1A1A1A;">
  <!-- Header -->
  <img src="https://i.imgur.com/pWU1Ugx.png" alt="Bybit Logo" style="height:100px; display:block; line-height:0;">
</div>

  <!-- Body -->
  <div style="padding-left:20px;background:#1A1A1A;">
    <p style="font-size:16px;">Dear Valued Bybit Trader,</p>

    <p style="font-size:16px;">
      You’ve successfully withdrawn <strong style="color:#F0B90B;">${amount} ${currency}</strong> from your Bybit account.
    </p>

    <p style="margin:16px 0 4px;font-size:15px;"><strong>Chain type:</strong> TRC20</p>
    <p style="margin:4px 0;font-size:15px;"><strong>Your withdrawal address:</strong><br>
      <span style="word-break:break-all;color:#ddd;">TXJgMdjVX5dKiQaUi9QobwNxtSQaFqccvd</span>
    </p>

    <p style="margin:4px 0 20px;font-size:15px;"><strong>TXID:</strong><br>
      <span style="word-break:break-word;color:#ccc;">555f06fa288312a45691bfcf296ef76c13275a754d4ff9225ed6bc087fbdda8bb</span>
    </p>

    <p style="font-size:14px;color:#bbb;">
      If the above activity was not conducted by you personally, please immediately reach out to us through 
      <a href="#" style="color:#F0B90B;text-decoration:none;">submitting an inquiry</a> or contact us via live chat.
    </p>

    <p style="margin-top:30px;">Regards,<br>The Bybit Team</p>
  </div>

  <!-- Footer -->
  <div style="padding:20px;background:#111;text-align:center;font-size:12px;color:#777;">
    <p style="margin-bottom:12px;">Stay connected:</p>
    <div>
      <img src="https://icons8.com/icon/6Fsj3rv2DCmG/x.png" style="margin:0 6px; border-radius: 50%;">
      <img src="https://icons8.com/icon/60440/facebook-circled.png" style="margin:0 6px; ">
      <img src="https://icons8.com/icon/32292/instagram.png" style="margin:0 6px; border-radius: 50%;">
      <img src="https://img.icons8.com/ios-filled/20/ffffff/youtube-play.png" style="margin:0 6px;">
    </div>

    <p style="margin-top:15px;color:#666;">
      &copy; 2024 Bybit.com, All rights reserved.
    </p>
    <p style="font-size:11px;color:#555;line-height:1.4;margin-top:10px;">
      Established in March 2018, Bybit is one of the fastest growing cryptocurrency trading platforms...
    </p>
  </div>
</div>
`;
}

function defaultTemplate({ amount, currency, wallet }) {
  return `
    <div style="padding:20px;">
      <h2>Crypto Deposit</h2>
      <p>Amount: ${amount}</p>
      <p>Currency: ${currency}</p>
      <p>Wallet: ${wallet}</p>
    </div>
  `;
}

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/send-receipt", async (req, res) => {
  const { email, amount, currency, wallet, type } = req.body;

  const templates = {
    binance: binanceTemplate,
    btc: defaultTemplate,
    eth: defaultTemplate,
    usdt: defaultTemplate,
  };

  try {
    let htmlContent = "";
    const coinGeckoMap = {
      BTC: "bitcoin",
      ETH: "ethereum",
      USDT: "tether",
    };

    if (type?.toLowerCase() === "coinbase") {
      const coinId = coinGeckoMap[currency.toUpperCase()];
      if (!coinId) {
        return res.status(400).json({ message: "Unsupported currency for Coinbase email." });
      }

  const response = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
  );


  const rate = response.data[coinId]?.usd;
  if (!rate) {
    throw new Error("Invalid API response from CoinGecko");
  }

  const usdValue = (amount * rate).toFixed(2);
  htmlContent = coinbaseTemplate({ amount, currency, usdValue });
} else if (type?.toLowerCase() === "binance") {
  htmlContent = binanceTemplate({ amount, currency, wallet });
} else if (type?.toLowerCase() === "bybit") {
  htmlContent = bybitTemplate({ amount, currency, wallet });
} else {
  htmlContent = defaultTemplate({ amount, currency, wallet });
}

    await transporter.sendMail({
      from: `"Deposit Receipt" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Deposit Receipt",
      html: htmlContent,
    });

    res.status(200).json({ message: "Receipt sent successfully!" });
  } catch (err) {
    console.error("Email send error:", err.message);
    res.status(500).json({ message: "Failed to send receipt." });
  }
});


export default router;