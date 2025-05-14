const { verifyToken } = require("../utils/jwt");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log("Received token:", token); // ➜ check token nhận đúng chưa

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = await verifyToken(token);
    console.log("Decoded token:", decoded); // ➜ log kết quả decode
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid user token" });
  }
};

module.exports = authMiddleware;
