import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';

// Extend Request type to include user property
declare module 'express' {
  interface Request {
    user?: {
      id: string;
      role: 'seller' | 'customer' | 'admin';
      adminRole?: 'superadmin' | 'useradmin';
      email: string;
      iat?: number;
      exp?: number;
    };
  }
}

// Configure Mailtrap transporter globally
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.EMAIL_PORT || '2525'),
  auth: {
    user: process.env.EMAIL_USER || '4260d5f9e4c5b6',
    pass: process.env.EMAIL_PASS || '88e29e88fc4226',
  },
});

// Helper to check if base email exists for the same role
const isBaseEmailTaken = async (baseEmail: string, role: string) => {
  const users = await User.find({ email: { $regex: `^${baseEmail}(?:_\d+)?$` }, role });
  return users.length > 0;
};

// Helper to extract base email (remove numeric suffix)
const getBaseEmail = (email: string): string => {
  const baseEmailMatch = email.match(/^(.+?)(?:_\d+)?$/);
  return baseEmailMatch ? baseEmailMatch[1] : email;
};

// Helper to get next unique ID for base email
const getNextUniqueId = async (baseEmail: string): Promise<number> => {
  const users = await User.find({ email: { $regex: `^${baseEmail}(?:_\d+)?$` } });
  const existingIds = users.map(u => {
    const match = u.email.match(/_(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  });
  return existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
};

// Seller Registration
export const registerSeller = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Received request at /register/seller:', {
      body: req.body,
      file: req.file,
      headers: req.headers,
    });

    const { companyName, email, contactNumber, originCountry } = req.body;
    const logoUrl = req.file?.filename ? `http://localhost:5000/uploads/${req.file.filename}` : null;

    console.log('Parsed data:', { companyName, email, contactNumber, originCountry, logoUrl });

    if (!companyName || !email || !contactNumber || !originCountry || !logoUrl) {
      console.log('Validation failed - Missing fields:', { companyName, email, contactNumber, originCountry, logoUrl });
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    if (!req.file || !['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
      console.log('Validation failed - Invalid file type:', req.file);
      res.status(400).json({ message: 'Only JPG or PNG images allowed' });
      return;
    }

    const baseEmail = getBaseEmail(email);
    if (await isBaseEmailTaken(baseEmail, 'seller')) {
      const nextId = await getNextUniqueId(baseEmail);
      const uniqueEmail = `${baseEmail}_${nextId}`;
      console.log('Base email taken, generating unique email:', uniqueEmail);
    }

    const nextId = await getNextUniqueId(baseEmail);
    const uniqueEmail = `${baseEmail}_${nextId}`;
    console.log('Generated unique email:', uniqueEmail);

    const sellerId = uuidv4();
    const seller = new User({
      companyName,
      email: uniqueEmail,
      contactNumber,
      originCountry,
      logoUrl,
      role: 'seller',
      status: 'pending',
      sellerId,
    });

    await seller.save();
    console.log('New seller saved to DB:', { _id: seller._id, email: seller.email, status: seller.status });
    res.status(201).json({ message: 'Seller registered successfully, pending admin approval', redirect: '/login', state: { fromRegistration: 'seller', email: baseEmail } });
  } catch (error: any) {
    console.error('Registration error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      file: req.file,
    });
    if (error.name === 'MongoError' && error.code === 11000) {
      res.status(409).json({ message: 'Duplicate sellerId conflict. Please try again.', error: error.message });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ message: 'Registration failed. Please try again.', error: error.message });
    }
    next(error);
  }
};

// [Customer and Admin registration remain unchanged]

// Login
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Login request received:', req.body);
    const { email, password, role, adminRole } = req.body;

    if (!email || !password || !role) {
      console.log('Validation failed - Missing fields:', { email, password, role });
      res.status(400).json({ message: 'Email, password, and role are required' });
      return;
    }

    const baseEmail = getBaseEmail(email);
    const users = await User.find({ email: { $regex: `^${baseEmail}(?:_\d+)?$` } }).sort({ updatedAt: -1 });
    console.log('Found users with base email pattern:', users.map(u => ({ _id: u._id, email: u.email, role: u.role, status: u.status, updatedAt: u.updatedAt, hasPassword: !!u.password })));

    if (users.length === 0) {
      console.log('Validation failed - No users found for base email:', baseEmail);
      res.status(401).json({ message: 'Invalid email' });
      return;
    }

    const user = users.find(u => u.role === role && u.password);
    console.log('Selected user for login:', user ? { _id: user._id, email: user.email, role: user.role, status: user.status, hasPassword: !!user.password } : null);
    if (!user) {
      console.log('Validation failed - No matching user with role and password:', { requestedRole: role, availableRoles: users.map(u => u.role) });
      res.status(403).json({ message: `No user found with role ${role} for this email.` });
      return;
    }

    if (user.role === 'admin' && !adminRole) {
      console.log('Validation failed - Admin role required:', { role });
      res.status(400).json({ message: 'Admin role is required' });
      return;
    }

    if (user.role === 'admin' && adminRole) {
      if (!user.adminRole || user.adminRole !== adminRole || !['useradmin', 'superadmin'].includes(adminRole)) {
        console.log('Validation failed - Invalid admin role:', { adminRole, userAdminRole: user.adminRole });
        res.status(403).json({ message: 'Invalid admin role' });
        return;
      }
    }

    if (user.role === 'seller' && user.status !== 'approved') {
      console.log('Validation failed - Seller not approved:', { _id: user._id, email: user.email, status: user.status });
      res.status(403).json({ message: 'Your seller account is not yet approved. Please wait for admin approval.' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password || '');
    if (!isValid) {
      console.log('Validation failed - Invalid password for:', { _id: user._id, email: user.email });
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const payload = {
      id: user._id,
      email: baseEmail,
      role: user.role,
      ...(user.role === 'admin' && { adminRole: user.adminRole }),
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });

    console.log('Login successful for:', { _id: user._id, email: user.email, role: user.role });
    res.json({
      token,
      message: 'Login successful',
      redirect: user.role === 'seller' ? '/seller/dashboard' : user.role === 'admin' ? '/useradmin' : '/customer',
    });
  } catch (error: any) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    });
    res.status(500).json({ message: 'Login failed. Please try again.', error: error.message });
    next(error);
  }
};

// Get Pending Sellers
export const getPendingSellers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Fetching pending sellers...', { user: req.user });
    const sellers = await User.find({ role: 'seller', status: 'pending' })
      .sort({ createdAt: -1 })
      .select('_id companyName email contactNumber originCountry logoUrl status sellerId');
    console.log('Pending sellers found in DB:', sellers.map(s => ({ _id: s._id, email: s.email, status: s.status })));
    res.json(sellers);
  } catch (error: any) {
    console.error('Error fetching pending sellers:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    });
    res.status(500).json({ message: 'Failed to fetch pending sellers.', error: error.message });
    next(error);
  }
};

// Seller Approval
export const approveSeller = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Approval request received:', {
      params: req.params,
      body: req.body,
      headers: req.headers,
      user: req.user,
    });
    const { id } = req.params;
    const { approve } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.log('Validation failed - Invalid ID:', { id });
      res.status(400).json({ message: 'Invalid seller ID' });
      return;
    }

    const seller = await User.findById(id);
    if (!seller || seller.role !== 'seller') {
      console.log('Seller not found or invalid role:', { id, role: seller?.role, exists: !!seller });
      res.status(404).json({ message: 'Seller not found' });
      return;
    }

    if (seller.status !== 'pending') {
      console.log('Seller already processed:', { _id: seller._id, email: seller.email, currentStatus: seller.status });
      res.status(400).json({ message: `Seller status is already ${seller.status}` });
      return;
    }

    if (approve) {
      seller.status = 'approved';
      const saveResult = await seller.save();
      if (!saveResult) throw new Error('Failed to save seller status update');
      console.log('Seller approved update result:', {
        _id: seller._id,
        email: seller.email,
        status: seller.status,
        updatedAt: saveResult.updatedAt,
        success: !!saveResult,
      });

      if (!seller.password) {
        const tempPassword = Math.random().toString(36).slice(-8);
        seller.password = await bcrypt.hash(tempPassword, 10);
        const passwordSaveResult = await seller.save();
        if (!passwordSaveResult) throw new Error('Failed to save temporary password');
        console.log('Temporary password update result:', {
          _id: seller._id,
          email: seller.email,
          tempPassword: tempPassword.substring(0, 4) + '***',
          success: !!passwordSaveResult,
        });

        const baseEmail = getBaseEmail(seller.email);
        const mailOptions = {
          from: 'admin@yourdomain.com',
          to: baseEmail,
          subject: 'Seller Account Approved - Temporary Password',
          text: `Hello ${seller.companyName},\n\nYour seller account has been approved. Use the temporary password below to log in to your dashboard:\n\nTemporary Password: ${tempPassword}\n\nPlease use your base email (${baseEmail}) for login.\n\nBest,\nYour Admin Team`,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log('Approval email sent successfully to:', { baseEmail, mailTo: mailOptions.to });
        } catch (emailError: any) {
          console.error('Email sending failed:', {
            message: emailError.message,
            code: emailError.code,
            response: emailError.response,
          });
          console.warn('Email failed but approval proceeded:', baseEmail);
        }
      }
      res.json({
        message: 'Seller has been approved',
        success: true,
      });
    } else {
      await User.findByIdAndDelete(id); // Delete seller on reject
      console.log('Seller rejected and deleted:', { _id: seller._id, email: seller.email });
      res.json({
        message: 'Seller has been rejected',
        success: true,
      });
    }
  } catch (error: any) {
    console.error('Error approving seller:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      details: error.details,
    });
    res.status(500).json({ message: 'Failed to update seller status.', error: error.message });
    next(error);
  }
};

// Change Password
export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById((req as any).user.id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isValid = await bcrypt.compare(currentPassword, user.password || '');
    if (!isValid) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ message: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters' });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to change password.', error: error.message });
    next(error);
  }
};