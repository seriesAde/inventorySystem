import jwt from 'jsonwebtoken';



import { env } from '../config/env.js';

export const generateToken = (userId, role) => {
  return jwt.sign({id:userId, role }, env.jwtAccessSecret, {
    expiresIn: '1d',
  });
};