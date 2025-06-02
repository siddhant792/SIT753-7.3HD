const jwt = require('jsonwebtoken');
const { User, Tenant } = require('../models');
const { ValidationError, UnauthorizedError } = require('../utils/errors');
const emailService = require('../services/email');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, tenantId, tenantName } = req.body;

    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    
    let tenant;
    if (tenantId) {
      
      tenant = await Tenant.findByPk(tenantId);
      if (!tenant) {
        throw new ValidationError('Invalid tenant ID');
      }
    } else if (tenantName) {
      
      tenant = await Tenant.create({
        name: tenantName,
        plan: 'free'
      });
    } else {
      
      tenant = await Tenant.create({
        name: `${name}'s Organization`,
        plan: 'free'
      });
    }

    
    const user = await User.create({
      name,
      email,
      password,
      tenantId: tenant.id,
      role: 'admin' 
    });

    
    try {
      await emailService.sendWelcomeEmail(user);
    } catch (emailError) {
      console.warn('Failed to send welcome email:', emailError.message);
      
    }

    
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    
    user.lastLogin = new Date();
    await user.save();

    
    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      }
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  
  
  res.status(200).json({ message: 'Logged out successfully' });
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser
}; 