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

function bybitTemplate({ amount, currency, wallet, bybitTag, txTag  }){
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

    <p style="margin:16px 0 4px;font-size:15px;"><strong>Chain type:</strong>${bybitTag}</p>
    <p style="margin:4px 0;font-size:15px;"><strong>Your withdrawal address:</strong><br>
      <span style="word-break:break-all;color:#ddd;">${wallet}</span>
    </p>

    <p style="margin:4px 0 20px;font-size:15px;"><strong>TXID:</strong><br>
      <span style="word-break:break-word;color:#ccc;">${txTag}</span>
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
    <div style="margin-bottom:10px;">
      <img src="https://img.icons8.com/ios-filled/20/ffffff/twitterx.png" alt="X" style="margin:0 6px;">
      <img src="https://img.icons8.com/ios-filled/20/ffffff/telegram-app.png" alt="Telegram" style="margin:0 6px;">
      <img src="https://img.icons8.com/ios-filled/20/ffffff/facebook-new.png" alt="Facebook" style="margin:0 6px;">
      <img src="https://img.icons8.com/ios-filled/20/ffffff/instagram-new.png" alt="Instagram" style="margin:0 6px;">
      <img src="https://img.icons8.com/ios-filled/20/ffffff/youtube-play.png" alt="YouTube" style="margin:0 6px;">
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

function trustwalletTemplate({amount, currency, usdValue, timeDate, wallet, status}) {
  return `
  <div style="max-width:600px;margin:auto; background:#121212; color:#fff; font-family:sans-serif; padding:15px;">
  <div>
    <div style="align-items:center;justify-content:space-between;">
        <!-- Amount Section -->
        <div style="max-width:600px;margin:10px; padding:15px;">
          <div style="text-align:center;">
          <div style="font-size:28px; font-weight:bold; padding: 10px 10px;">Transfer</div>
            <div style="font-size:28px; font-weight:bold;">${amount} ${currency}</div>
            <div style="font-size:14px; color:#8e8e8e; margin-top:5px;">≈ $${usdValue}</div>
          </div>
        </div>

        <!-- Date, Status, Recipient Section -->
        <div>
          <div style="background:#1e1e1e; margin-top:15px; margin-bottom:15px; border-radius:8px; outline:none; padding:15px;">
          <table cellpadding="0" cellspacing="0" style="width:100%; font-size:14px; color:#ccc;">
          <tr>
            <td style="padding:8px 0; text-align:left;">Date</td>
            <td style="padding:8px 0; text-align:right;">${timeDate}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; text-align:left;">Status</td>
            <td style="padding:8px 0; text-align:right; color:#4caf50;">${status}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; text-align:left;">Recipient</td>
            <td style="padding:8px 0; text-align:right;">${wallet}</td>
          </tr>
        </table>
          </div>
        </div>

        <!-- Network Fee Section -->
        <div>
        <div style="background:#1e1e1e; margin-top:15px; margin-bottom:15px; border-radius:8px; outline:none; padding:15px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; color:#ccc;">
              <tr>
                <td style="padding:8px 0; text-align:left;">Network Fee</td>
                <td style="padding:8px 0; text-align:right;">0 TRX</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- More Details Button -->
        <div>
        <div style="background:#1e1e1e; margin-top:15px; margin-bottom:15px; border-radius:8px; outline:none; padding:15px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:16px; color:##fff;">
        <tr>
             <td style="padding:8px 0; text-align:left;"> More Details </td>
              <td style="padding:8px 0; text-align:right;"> > </td>
            </tr>
            </table>
          </td>
        </div>
    </div>
  </div>
</div>
`
}

function safepalTemplate({amount, currency, wallet, timeDate, status, fromTag, toTag, idTag, heightTag }){
  return `
  <div style="background:#121212;padding:20px;font-family:sans-serif;color:#fff;max-width:400px;margin:auto;border-radius:12px;">
  <h2 style="text-align:center;margin-bottom:20px;">Transaction Details</h2>
  
  <div style="text-align:center;margin-bottom:15px;">
    <h3 style="margin:0;">Send</h3>
  </div>

  <div style="background:#1f1f1f;padding:15px;border-radius:10px;margin-bottom:15px;">
  <div style="display:inline-flex;">
    <img src="https://cryptologos.cc/logos/tether-usdt-logo.png" alt="USDT" style="width:30px;vertical-align:middle;margin-right:8px;">
    <div style="display:inline-grid;">
    <div style="margin:0;font-size:18px;"> ${amount} ${currency}</div>
    <div style="padding:0;color:#aaa;">${wallet}</div></div>
  </div>
  </div>
  

  <div style="background:#1f1f1f;padding:15px;border-radius:10px;margin-bottom:15px;">
   <table cellpadding="0" cellspacing="0" style="width:100%;">
   <tr>
    <td style="padding:8px 0; text-align:left; margin:0;"><strong>Status:</strong></td> 
    <td style="color:#00ff88;padding:8px 0; text-align:right">${status}</td>
    <tr>
    <td style="margin:5px 0 0 0;padding:8px 0; text-align:left;"><strong>Time:</strong></td>
    <td style="padding:8px 0; text-align:right">${timeDate}</td>
    </table>
  </div>

  <div style="background:#1f1f1f;padding:15px;border-radius:10px;margin-bottom:15px;">
    <p style="margin:0;color:#aaa; "><strong>From</strong></p>
    <table cellpadding="0" cellspacing="0" style="width:100%;">
    <tr>
    <td style="padding:8px 0; text-align:left; word-break:break-all;margin:5px 0;">${fromTag}</td>
    <td style="padding:8px 0; text-align:right">
    <img width="15" height="15" style="color:#7B61FF" src="https://img.icons8.com/fluency-systems-regular/48/copy--v1.png" alt="copy--v1"/>
    </td>
    </tr>
    </table>
    <div style="border-bottom: 1px solid #ccc; margin: 10px 0;"></div>
  <table cellpadding="0" cellspacing="0" style="width:100%;">
    <tr>
    <td style="padding:8px 0; text-align:left; word-break:break-all;margin:5px 0;color:#aaa;color:#aaa;">To</td>
    <td style="padding:8px 0; text-align:right">
    <img width="15" height="15" src="https://img.icons8.com/softteal/24/admin-settings-male.png" alt="admin-settings-male"/>
    </td>
    </tr>
    </table>

    <table cellpadding="0" cellspacing="0" style="width:100%;">
    <tr>
    <td style="padding:8px 0; text-align:left; word-break:break-all;margin:5px 0;">${toTag}</td>
    <td style="padding:8px 0; text-align:right">
    <img width="15" height="15" style="color:#7B61FF" src="https://img.icons8.com/fluency-systems-regular/48/copy--v1.png" alt="copy--v1"/>
    </td>
    </tr>
    </table>
    </div>

    <div style="background:#1f1f1f;padding:15px;border-radius:10px;margin-bottom:15px;">
    <table cellpadding="0" cellspacing="0" style="width:100%;">
    <tr>
    <td style="margin:0;padding:8px 0; text-align:left"><strong>TxID:</strong></td>
    <td style="padding:8px 0; text-align:right"><a href="#" style="color:#66ccff;text-decoration:none;">${idTag}</a> 
    <img width="15" height="15" style="color:#7B61FF" src="https://img.icons8.com/fluency-systems-regular/48/copy--v1.png" alt="copy--v1"/>
    </td>
    </tr>

    <tr>
    <td style="margin:5px 0 0 0;padding:8px 0; text-align:left"><strong>Height:</strong></td>
    <td style="padding:8px 0; text-align:right">
    ${heightTag}
    </td>
    </tr>
    </table>
    </div>
    
   
  <div style="text-align:center;border-radius:10px;margin-bottom:15px;">
    <div style="background:#121212;padding:10px 20px;max-width:400px;border: 1px solid #5A6DFF;border-radius:8px;color:#fff;cursor:pointer;font-size:14px;">
      Transfer to Him/Her
    </div>
  </div>
</div>
  `
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
  const { amount, currency, wallet, email, walletName, bybitTag, timeDate, status, safepalTag } = req.body;

  const coinGeckoMap = {
    BTC: "bitcoin",
    ETH: "ethereum",
    USDT: "tether",
  };


  let htmlContent = "";
  const sanitizedWalletName = walletName.replace(/\s+/g, '').toLowerCase();

  try{
  switch (sanitizedWalletName) {
    case 'binance':
      htmlContent = binanceTemplate({ amount, currency, wallet, status });
      break;
      case 'coinbase':
        const coinId = coinGeckoMap[currency.toUpperCase()];
        if (!coinId) return res.status(400).json({ message: "Unsupported currency for Coinbase." });

        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
        const rate = response.data[coinId]?.usd;
        if(!rate) throw new Error("Invalid API response from coinGecko");

        const usdValue = (amount * rate).toFixed(2);
        htmlContent = coinbaseTemplate({ amount, currency, usdValue });
        break;
        case 'bybit':
         const chainType = bybitTag?.bybit || 'Unknown Chain';
          const txId = bybitTag?.tx || 'N/A';
          htmlContent = bybitTemplate({ amount, currency, wallet, bybitTag: chainType, txTag: txId });
          break;
          case 'trustwallet':
            const coinIdTrust = coinGeckoMap[currency.toUpperCase()];
            if (!coinIdTrust) return res.status(400).json({ message: "Unsupported currency for Trust Wallet." });
          
            const responseTrust = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIdTrust}&vs_currencies=usd`);
            const trustRate = responseTrust.data[coinIdTrust]?.usd;
            if (!trustRate) throw new Error("Invalid API response from CoinGecko");
          
            const trustUsdValue = (amount * trustRate).toFixed(2);
            htmlContent = trustwalletTemplate({ amount, currency, usdValue: trustUsdValue, wallet, timeDate, status });
            break;
            case 'safepal':
              const fromType = safepalTag?.from || 'Unknown Wallet';
              const toType = safepalTag?.to || 'Unknown Wallet';
              const heightType = safepalTag?.height || 'Unknown Height';
              const idType = safepalTag?.id || 'N/A';
              htmlContent = safepalTemplate({amount, currency, wallet, timeDate, status, fromTag: fromType, toTag: toType, heightTag: heightType, idTag: idType });
              break;  
          default:
            htmlContent = defaultTemplate({ amount, currency, wallet });
  }


   const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Your ${walletName}  Transaction Receipt`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);

    res.json({message: `Receipt sent to ${email}`});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send receipt.", error: err.message });
  }
});


export default router;