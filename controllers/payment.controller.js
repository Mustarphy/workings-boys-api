import axios from 'axios';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

const SUBSCRIPTION_PLANS = {
    basic: { amount: 20000, stars: 20, name: "Basic Plan" }, // ₦10,000 in kobo
    premium: { amount: 2000000, stars: 50, name: "Premium plan" }, // ₦20,000 in kobo
    pro: { amount: 3000000, stars: 100, name: "Pro Plan" }, // ₦30,000 in kobo
};

export const initializePayment = async (req, res) => {
    try {
        const { planType } = req.body;
        const userId = req.userId;

        console.log('Initializing payment for user:', userId, 'plan:', planType);
        console.log('PAYSTACK_SECRET_KEY exists:', !!PAYSTACK_SECRET_KEY);
        console.log('CLIENT_URL:', process.env.CLIENT_URL);

        // Validate inputs
        if (!planType) {
            return res.status(400).json({ message: "Plan type is required" });
        }

        if (!SUBSCRIPTION_PLANS[planType]) {
            return res.status(400).json({ 
                message: "Invalid subscription plan",
                availablePlans: Object.keys(SUBSCRIPTION_PLANS)
            });
        }

        if (!PAYSTACK_SECRET_KEY) {
            console.error('PAYSTACK_SECRET_KEY is not set');
            return res.status(500).json({ message: "Payment service configuration error" });
        }

        const plan = SUBSCRIPTION_PLANS[planType];

        // Get user details
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, username: true }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log('User found:', user.email);

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                userId: userId,
                amount: plan.amount / 100, // Convert kobo to naira for database
                starsPurchased: plan.stars,
                paymentStatus: 'pending',
                paymentMethod: 'paystack',
            }
        });

        console.log('Payment record created:', payment.id);

        // Initialize payment with paystack  
        const reference = `PAY_${payment.id}_${Date.now()}`;
        const paystackData = {
            email: user.email,
            amount: plan.amount,
            reference: reference,
            // FIXED: Correct callback URL that matches your frontend route
            callback_url: `${process.env.CLIENT_URL}/dashboard/subscription`,
            metadata: {
                userId: userId,
                paymentId: payment.id,
                planType: planType,
                stars: plan.stars,
                username: user.username
            },
            channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
        };

        console.log('Calling Paystack with data:', paystackData);

        const paystackResponse = await axios.post(
            `${PAYSTACK_BASE_URL}/transaction/initialize`,
            paystackData,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        console.log('Paystack response:', paystackResponse.data);

        if (paystackResponse.data.status) {
            // Update payment with Paystack reference
            await prisma.payment.update({
                where: { id: payment.id },
                data: { transactionId: reference }
            });

            return res.status(200).json({
                message: "Payment initiated successfully",
                data: {
                    authorization_url: paystackResponse.data.data.authorization_url,
                    access_code: paystackResponse.data.data.access_code,
                    reference: reference,
                    paymentId: payment.id
                }
            });
        } else {
            return res.status(400).json({
                message: "Failed to initiate payment",
                error: paystackResponse.data.message
            });
        }

    } catch (err) {
        console.error('Payment initialization error:', err);
        return res.status(500).json({
            message: "Failed to initialize payment",
            error: err.response?.data?.message || err.message
        });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.body;
        const userId = req.userId;

        console.log('Verifying payment:', reference, 'for user:', userId);

        if (!reference) {
            return res.status(400).json({ message: "Payment reference is required" });
        }

        // Verify payment with Paystack
        const verifyResponse = await axios.get(
            `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
                }
            }
        );

        console.log('Paystack verification response:', verifyResponse.data);

        if (!verifyResponse.data.status) {
            return res.status(400).json({
                message: "Payment verification failed",
                error: verifyResponse.data.message
            });
        }

        const paymentData = verifyResponse.data.data;

        // Check if payment was successful
        if (paymentData.status !== 'success') {
            return res.status(400).json({
                message: "Payment was not successful",
                status: paymentData.status
            });
        }

        // Find the payment record
        const payment = await prisma.payment.findFirst({
            where: {
                transactionId: reference,
                userId: userId
            }
        });

        if (!payment) {
            return res.status(404).json({ message: "Payment record not found" });
        }

        if (payment.paymentStatus === 'completed') {
            // Payment already processed, return current user stars
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { stars: true }
            });

            return res.status(200).json({
                message: "Payment already verified",
                stars: payment.starsPurchased,
                totalStars: user.stars,
                amount: payment.amount
            });
        }

        // Verify amount matches
        const expectedAmount = payment.amount * 100; // Convert to kobo
        if (paymentData.amount !== expectedAmount) {
            return res.status(400).json({
                message: "Payment amount mismatch",
                expected: expectedAmount,
                received: paymentData.amount
            });
        }

        // Update payment status
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                paymentStatus: 'completed',
                updatedAt: new Date()
            }
        });

        // Add stars to user account
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                stars: {
                    increment: payment.starsPurchased
                }
            }
        });

        // Record star transaction
        await prisma.starTransaction.create({
            data: {
                userId: userId,
                starsUsed: payment.starsPurchased,
                transactionType: 'purchase',
                description: `Purchased ${payment.starsPurchased} stars for ₦${payment.amount} via Paystack`
            }
        });

        console.log('Payment verified successfully for user:', userId);

        return res.status(200).json({
            message: "Payment verified successfully",
            stars: payment.starsPurchased,
            totalStars: updatedUser.stars,
            amount: payment.amount
        });

    } catch (err) {
        console.error('Payment verification error:', err);
        return res.status(500).json({
            message: "Failed to verify payment!",
            error: err.response?.data?.message || err.message
        });
    }
};

export const handleWebhook = async (req, res) => {
    try {
        const hash = crypto
            .createHmac('sha512', PAYSTACK_SECRET_KEY)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash === req.headers['x-paystack-signature']) {
            const event = req.body;

            console.log('Webhook received:', event.event);

            if (event.event === 'charge.success') {
                const { reference, status, amount } = event.data;

                // Find payment record
                const payment = await prisma.payment.findFirst({
                    where: { transactionId: reference }
                });

                if (payment && payment.paymentStatus === 'pending') {
                    // Update payment status
                    await prisma.payment.update({
                        where: { id: payment.id },
                        data: { paymentStatus: 'completed' }
                    });

                    // Add stars to user account
                    await prisma.user.update({
                        where: { id: payment.userId },
                        data: {
                            stars: {
                                increment: payment.starsPurchased
                            }
                        }
                    });

                    // Record star transaction
                    await prisma.starTransaction.create({
                        data: {
                            userId: payment.userId,
                            starsUsed: payment.starsPurchased,
                            transactionType: 'purchase',
                            description: `Purchased ${payment.starsPurchased} stars for ₦${payment.amount} via Paystack webhook`
                        }
                    });

                    console.log('Webhook processed successfully for payment:', payment.id);
                }
            }
        } else {
            console.log('Invalid webhook signature');
        }

        return res.status(200).send('OK');
    } catch (err) {
        console.error('Webhook error:', err);
        return res.status(500).send('Error');
    }
};

export const getUserStars = async (req, res) => {
    try {
        const userId = req.userId;

        console.log('Getting stars for user:', userId);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { stars: true }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            stars: user.stars || 0
        });

    } catch (err) {
        console.error('Get user stars error:', err);
        return res.status(500).json({ message: "Failed to get user stars!" });
    }
};

export const deductStars = async (req, res) => {
    try {
        const userId = req.userId;
        const starsToDeduct = 5; // Fixed cost per receipt generation

        console.log('Deducting stars for user:', userId);

        // Get current user stars
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { stars: true }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if ((user.stars || 0) < starsToDeduct) {
            return res.status(400).json({
                message: "Insufficient stars. Please purchase more stars to generate receipt.",
                currentStars: user.stars || 0,
                requiredStars: starsToDeduct
            });
        }

        // Deduct stars from user account
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                stars: {
                    decrement: starsToDeduct
                }
            }
        });

        // Record star transaction
        await prisma.starTransaction.create({
            data: {
                userId: userId,
                starsUsed: starsToDeduct,
                transactionType: 'usage',
                description: 'Used 5 stars for receipt generation'
            }
        });

        return res.status(200).json({
            message: "Stars deducted successfully",
            remainingStars: updatedUser.stars
        });

    } catch (err) {
        console.error('Deduct stars error:', err);
        return res.status(500).json({ message: "Failed to deduct stars!" });
    }
};

export const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.userId;

        console.log('Getting payment history for user:', userId);

        const payments = await prisma.payment.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
            take: 20 // Limit to last 20 payments
        });

        return res.status(200).json({ payments });

    } catch (err) {
        console.error('Get payment history error:', err);
        return res.status(500).json({ message: "Failed to get payment history!" });
    }
};