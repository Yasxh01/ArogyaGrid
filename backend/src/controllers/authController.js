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

exports.me = (req, res) => {
  res.json({ user: req.user });
};
