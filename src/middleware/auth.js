import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  console.log("🔐 MIDDLEWARE CALLED");
  const authHeader = req.headers.authorization;
  console.log("--> AAA: ", authHeader);
  console.log("📋 All Headers: ", req.headers);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ NO TOKEN OR WRONG FORMAT");
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];
  console.log("✅ TOKEN EXTRACTED: ", token.substring(0, 20) + "...");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ TOKEN VERIFIED: ", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("❌ TOKEN INVALID: ", err.message);
    return res.status(401).json({ message: "Token is not valid" });
  }
};

export default authMiddleware;
