import jwt from "jsonwebtoken";
export const generateToken = ({
  payload = {
    id: user._id,
    role: user.role
  },
  signature = process.env.TOKEN_SIGNATURE,
  expiresIn = "2d"
} = {}) => {
  const token = jwt.sign(payload, signature, {
    expiresIn
  });
  return token;
};
export const verifyToken = ({
  token,
  signature = process.env.TOKEN_SIGNATURE
} = {}) => {
  const decoded = jwt.verify(token, signature);
  return decoded;
};