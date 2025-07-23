import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users)
    }catch (err) {
       console.log(err)
       res.status(500).json({message:"failed to get users!"})
    }
};

export const getUser = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await prisma.user.findUnique({
            where: { id },
        });
        res.status(200).json(user)
    }catch (err) {
       console.log(err)
       res.status(500).json({message:"failed to get user!"})
    }
}

export const updateUser = async (req, res) => {
    const id = req.params.id;
    const tokenUserId = req.userId;
    const {password, avatar, ...inputs} = req.body;

    if(id !== tokenUserId){
        return res.status(403).json({message:"Not Authorized!"})
    }

    let updatePassword = null
    try {


        if(password){
            updatePassword = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where:{id},
            data:{
                ...inputs,
                ...(updatePassword && {password:updatePassword}),
                ...(avatar && {avatar}),
            },
        });

        const {password:userPassword, ...rest} = updatedUser;

        res.status(200).json(rest);
    }catch (err) {
       console.log(err)
       res.status(500).json({message:"failed to get update user"})
    }
}

export const changePassword = async (req, res) => {
  const { id } = req.params;
  const tokenUserId = req.userId; // From verifyToken middleware
  const { oldPassword, newPassword } = req.body;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    // Remove password from response
    const { password, ...rest } = updatedUser;

    res.status(200).json(rest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to change password." });
  }
};

