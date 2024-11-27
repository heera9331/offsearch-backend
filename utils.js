import jwt from "jsonwebtoken";

const JWT_SECRET = "most-common-password-here" || "";

const generateToken = (payload) => {
  return jwt.sign({ payload }, JWT_SECRET, { expiresIn: "1h" });
};

const checkUser = (req, res, next) => {
  const userId = req.headers["user-id"];
  if (!userId) {
    return res.status(401).json({ error: "User ID is required in headers." });
  }
  req.userId = parseInt(userId, 10);
  next();
};

export { generateToken, checkUser };
