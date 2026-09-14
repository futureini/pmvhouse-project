const jwt = require("jsonwebtoken");

const SECRET = process.env.SECRET || "mysecretkey";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "No token" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const user = jwt.verify(token, SECRET);

    req.user = user;
    next();
  } catch (err) {
    console.log("❌ TOKEN ERROR:", err.message);
    return res.status(403).json({ message: "Invalid token" });
  }
};

/**
 * Soft/optional auth for PUBLIC read routes (GET listings, GET by id).
 * Unlike verifyToken, this NEVER blocks the request — anonymous visitors
 * must still be able to browse listings. It only sets req.isAdmin so the
 * route handler can decide whether to include private fields (e.g. the
 * registered owner/customer phone number) in the response.
 *
 * Important: this actually verifies the JWT signature (jwt.verify), it
 * does not just check whether an Authorization header is present — a
 * present-but-invalid/expired header must NOT be treated as admin access.
 */
const optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  req.isAdmin = false;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const user = jwt.verify(token, SECRET);
      req.user = user;
      req.isAdmin = true;
    } catch (err) {
      // Invalid/expired token on a public route: treat as anonymous,
      // don't block the request and don't leak private fields.
      req.isAdmin = false;
    }
  }

  next();
};

module.exports = verifyToken;
module.exports.verifyToken = verifyToken;
module.exports.optionalVerifyToken = optionalVerifyToken;
