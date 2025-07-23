import express from 'express';
import { changePassword, getUsers, updateUser, } from '../controllers/user.controller.js';
import { verifyToken } from './../middleware/verifyToken.js';

const router = express.Router();

router.get("/", getUsers);
router.put("/:id", verifyToken, updateUser);
router.put("/:id/change-password", verifyToken, changePassword); 

export default router;
