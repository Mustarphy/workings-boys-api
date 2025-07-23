import express from 'express';
import { register, login, logout, request, verify, reset  } from './../controllers/auth.controller.js';

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.post("/request-otp", request);

router.post("/verify-otp", verify);

router.post("/reset-password", reset);


export default router;