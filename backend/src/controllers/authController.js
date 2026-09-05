const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../config/env');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = db.memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, district_id: user.district_id, phc_id: user.phc_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        district_id: user.district_id,
        phc_id: user.phc_id
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, district_id, phc_id } = req.body;
    const store = db.memoryStore;

    const existing = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'Email is already registered', code: 'EMAIL_IN_USE' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'password123', salt);

    const newUser = {
      id: 'USR-' + Date.now().toString(36).toUpperCase(),
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role: role || 'PHC_STAFF',
      district_id: district_id || 'DIST-JH-01',
      phc_id: phc_id || (role === 'ADMIN' ? null : 'PHC-RAN-01'),
      created_at: new Date()
    };

    store.users.push(newUser);

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, district_id: newUser.district_id, phc_id: newUser.phc_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        district_id: newUser.district_id,
        phc_id: newUser.phc_id
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.me = (req, res) => {
  res.json({ user: req.user });
};
