
// **
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const getTokenFromRequest = (req) => {
    if (req.header("Authorization")?.startsWith("Bearer ")) {
        return req.header("Authorization").split(" ")[1];
    }
    if (req.cookies?.token) return req.cookies.token;
    if (req.body?.token) return req.body.token;
    if (req.query?.token) return req.query.token;
    return null;
};
const authMiddleware = async (req, res, next) => {
    try {
        // Ensure token exists
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        // Extract token
        const token = getTokenFromRequest(req);
        // console.log("Authorization Header:", req.header("Authorization"));

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.id) {
            return res.status(401).json({ error: "Unauthorized: Token is invalid" });
        }

        // Fetch user (excluding password)
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ error: "Unauthorized: User not found" });
        }

        req.user = user; // Attach user info to request
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
    }
};

module.exports = authMiddleware;
