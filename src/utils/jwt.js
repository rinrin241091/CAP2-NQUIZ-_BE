require("dotenv").config();
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET_KEY;

module.exports.generateToken = async (user) => {
  console.log("User object:", user);

  const payload = {
    email: user.sub, 
  };

  console.log("Generated Payload:", payload);

  const accessToken = jwt.sign(payload, secretKey, {
    algorithm: "HS256",
    expiresIn: "1d",
  });

  const refreshToken = jwt.sign(payload, secretKey, {
    algorithm: "HS256",
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

module.exports.verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, secretKey);
    console.log("Decoded test:", decoded);
    return decoded;
  } catch (error) {
    throw new Error("Token is invalid or expired");
  }
};

