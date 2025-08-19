import prisma from "../lib/prisma";
import { updateUser } from './user.controller';

export const generateWalletProof = async (req, res) => {
    try {
        const userId = req.userId;
        const START_PER_GENERATION = 5;

        //FIRST, CHECK IF USER HAS ENOUGH STARS
        const user = await prisma.user.findUnique({
            where: {id: userId},
            select: {stars: true, email: true}
        });

        if(!user) {
            return res.status(404).json({message: "User not found"});
        }

        if (user.stars < START_PER_GENERATION) {
            return res.status(400).json({
                message: "Insufficient stars. Please purchase more stars to generate receipt",
                currentStars: user.stars,
                requiredStars: START_PER_GENERATION
            });
    }

    const {
        email,
        amount,
        currency,
        wallet,
        timeDate,
        status,
        walletName,
        bybitTag,
        safepalTag
    } = req.body;

    await prisma.user.update({
        where: {id: userId},
        data: {
            stars:{
                decrement: START_PER_GENERATION
            }
        }
    });

    // Record the star transaction
    await prisma.starTransaction.create({
        data: {
            userId: userId,
            starsUsed: START_PER_GENERATION,
            transactionType: 'usage',
            description: `Generated ${walletName} receipt - ${currency} ${amount}`
        }
    });

    // Get update star count
    const updateUser = await prisma.user.findUnique({
        where: {id: userId},
        select: {stars: true}
    });

    res.status(200).json({
        message: "Receipt generated successfully",
        remainingStars: updatedUser.stars
    });

} catch (err) {
    console.log(err);
    res.status(500).json({message: "Failed to generate receipt!"});
}

}