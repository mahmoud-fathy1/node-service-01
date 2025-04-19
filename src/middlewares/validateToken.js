import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const secretKey = process.env.TOKEN_SIGNATURE;
const validateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(401).json({
            error: true,
            message: "Access Denied. No token provided.",
        });
    }
    const token = authHeader.split("Barear ")[1];
    if (!token) {
        return res.status(401).json({
            error: true,
            message: "Access Denied. Invalid token format.",
        });
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(403).json({
            error: true,
            message: "Invalid or expired token.",
        });
    }
};
export default validateToken;
