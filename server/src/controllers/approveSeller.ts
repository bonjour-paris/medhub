import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

// Configure Mailtrap transporter using .env
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 2525,
  auth: {
    user: process.env.EMAIL_USER || '4260d5f9e4c5b6',
    pass: process.env.EMAIL_PASS || '88e29e88fc4226',
  },
});

export const approveSeller = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Approval request:', req.params, req.body);
    const { id } = req.params;
    const { approve } = req.body;

    const seller = await User.findById(id);
    if (!seller || seller.role !== 'seller') {
      console.log('Seller not found or invalid role:', { id, role: seller?.role });
      res.status(404).json({ message: 'Seller not found' });
      return;
    }

    seller.status = approve ? 'approved' : 'rejected';
    await seller.save();
    console.log('Seller status updated:', { id, status: seller.status });

    if (approve) {
      // Generate and hash temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      seller.password = await bcrypt.hash(tempPassword, 10);
      await seller.save();
      console.log('Temporary password generated:', tempPassword);

      // Send approval email
      const mailOptions = {
        from: 'admin@yourdomain.com', // Update with a valid from email or use .env
        to: seller.email,
        subject: 'Seller Account Approved - Temporary Password',
        text: `Hello ${seller.companyName},\n\nYour seller account has been approved. Use the temporary password below to log in to your dashboard:\n\nTemporary Password: ${tempPassword}\n\nPlease change your password after logging in.\n\nBest,\nYour Admin Team`,
      };

      await transporter.sendMail(mailOptions);
      console.log('Approval email sent to:', seller.email);
    }

    res.json({ message: approve ? 'Seller approved and email sent' : 'Seller rejected' });
  } catch (error: any) {
    console.error('Approval error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    });
    res.status(500).json({ message: 'Failed to update seller status.', error: error.message });
    next(error);
  }
};