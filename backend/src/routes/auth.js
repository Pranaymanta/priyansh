import express from 'express';
import { supabase } from '../config/supabase.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Sign up endpoint
router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName, role, phone } = req.body;

    // Validate input
    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // Create user profile in database
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role,
        phone,
        created_at: new Date(),
      });

    if (profileError) throw profileError;

    const token = jwt.sign(
      { id: authData.user.id, email, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: authData.user,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) throw userError;

    const token = jwt.sign(
      { id: data.user.id, email: data.user.email, role: userData.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      user: userData,
      token,
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
});

export default router;