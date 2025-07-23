import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import nodemailer  from 'nodemailer';

export const register = async (req, res)=>{
    const {username, email, password} = req.body;

    try{

    //hash the password

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(hashedPassword)

    //create a new user
    const newUser = await prisma.user.create({
        data:{
            username,
            email,
            password: hashedPassword,
        }
    });

    console.log(newUser);

    res.status(201).json({message: "User created successfully"});
    } catch (error) {
        console.error(error)
        res.status(500).json ({message: "Error creating user"});
    }
}; 
export const login = async (req, res)=>{
    const {email, password} = req.body;

    try{

    // check if the user exits

    const user = await prisma.user.findUnique({
        where:{email}
        })

        if (!user) return res.status(401).json({message: " Invalid email or password"});

    // check if the password is correct

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) return res.status(401).json ({message: "Invalid email or password"});

    //generate cookie token and send to the user

    // res.setHeader("Set-Cookie", "test=" + "myValue").json ({message: "Logged in successfully"});

    const age = 100 * 60 * 60 * 24 * 7;

    const token = jwt.sign({
        id: user.id,
        isAdmin: false,
    }, process.env.JWT_SECRET_KEY,
    {expiresIn: age}
    );

    const {password: userPassword, ...userIfon} = user

    res
    .cookie("token", token, {
        httpOnly: true,
        secure: true, // Required when using SameSite=None
        sameSite: "None",
        // secure: true,
        maxAge: age,
    })
    .status(200)
    .json(userIfon);
    } catch (error) {
        console.error(error)
        res.status(500).json ({message: "Error logging in"});
    }
};

export const logout = (req, res)=>{
    res.clearCookie("token").status(200).json({message: "Logged out successfully"});
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

export const request = async (req, res)=>{
    try {
    const {email} = req.body;
    const user = await prisma.user.findUnique({where: {email}});
    if(!user) return res.status(404).json({message: "User not found"});
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await prisma.user.update({
        where: {email}, 
        data: {
            otp,
            otpExpires: new Date(Date.now() + 10 * 60 * 1000),
            otpVerified: false,
        },
    });
    const htmlContent = `
    <div style="max-width:600px;margin:auto;background:#ffffff;font-family:'Helvetica Neue',Arial,sans-serif;border:1px solid #e0e0e0;">
    <!-- Header -->
    <div style="background:#f5f8fb;padding:30px 20px;text-align:center;">
      <h1 style="color:#1652f0;font-size:28px;margin:0;">CryptoToken</h1>
    </div>
  
    <!-- Checkmark Icon -->
    <div style="text-align:center;padding:40px 20px 20px;">
      <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Check" style="width:72px;height:72px;">
    </div>
  
    <!-- Main Message -->
    <div style="text-align:center;padding:0 20px 20px;">
      <h2 style="color:#333;font-size:20px;margin-bottom:10px;">Your OTP code is</h2>
      <p style="color:#333;font-size:24px;margin:0;"><strong> ${otp}</strong></p>
    </div>
  
    <!-- CTA Button -->
    <div style="text-align:center;padding:20px;">
      <a href="#" style="background:#1652f0;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:4px;font-weight:bold;display:inline-block;font-size:15px;">
        Complete Your password-reset
      </a>
    </div>
  
    <!-- Footer -->
    <div style="text-align:center;padding:20px;font-size:12px;color:#aaa;">
      <p>© 2025 CryptoToken, Inc. All rights reserved.</p>
    </div>
  </div>
  `;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject:  "Your OTP Code - CryptoToken",
      html: htmlContent,
    })
    res.json({message: `OTP sent to ${email}`});
} catch (err) {
    console.error("OTP SEND ERROR:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

//verify OTP
export const verify = async (req, res)=>{
    const { email, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || user.otp !== otp || new Date() > new Date(user.otpExpires)) {
      return res.status(400).json({ message: 'Invalid or Expired OTP' });
    }
    
    await prisma.user.update({
      where: { email },
      data: { otpVerified: true },
    });
    
    res.json({ message: 'OTP verified' });
    
} 


export const reset = async (req, res)=>{
    const {email, password} = req.body;
    const user = await prisma.user.findUnique({where: {email}});
    if (!user || !user.otpVerified) return res.status(400).json({ message: 'Unauthorized password reset'});
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
        where: {email},
        data: {
            password: hashed,
            otp: null,
            otpExpires: null,
            otpVerified: false,
        },
    });
    res.json({message: 'Password updated successfully'});
}