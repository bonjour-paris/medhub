import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import User from '../models/User';

const generateTempPassword = (): string => Math.random().toString(36).slice(-8);

export const approveSeller = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sellerId = req.params.id;
    const { approve } = req.body;

    const seller = await User.findById(sellerId);
    if (!seller || seller.role !== 'seller') {
      res.status(404).json({ message: 'Seller not found' });
      return;
    }

    if (seller.status !== 'pending') {
      res.status(400).json({ message: 'Seller already processed' });
      return;
    }

    if (!approve) {
      seller.status = 'rejected';
      await seller.save();
      res.json({ message: 'Seller rejected' });
      return;
    }

    const tempPassword = generateTempPassword();
    seller.status = 'approved';
    seller.password = await bcrypt.hash(tempPassword, 10);
    await seller.save();

    const transporter = nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: seller.email,
      subject: 'Seller Account Approved – Temporary Password',
      text: `Hello ${seller.companyName ?? 'Seller'},\n\n` +
            `Your account has been approved!\n` +
            `Temporary password: ${tempPassword}\n\n` +
            `Please log in at http://localhost:5173/login and change your password ASAP.\n`,
    });

    res.json({ message: 'Seller approved and email sent' });
  } catch (error) {
    console.error('Email error:', error);
    next(error);
  }
};