import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

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
