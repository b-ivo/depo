import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Business from "../models/Business.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ======================================
    // CHECK AUTHORIZATION HEADER
    // ======================================
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Expected:
    // Authorization: Bearer TOKEN
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format.",
      });
    }

    const token = parts[1];

    // ======================================
    // VERIFY JWT
    // ======================================
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
    );

    // ======================================
    // GET CURRENT USER FROM DATABASE
    // ======================================
    const user = await User.findById(decoded.userId)
      .select("-passwordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    // ======================================
    // SUPERADMIN
    // ======================================
    // Superadmins do not belong to a business,
    // so business status does not apply to them.
    if (user.role === "superadmin") {
      if (!user.active) {
        return res.status(403).json({
          success: false,
          message: "This account is inactive.",
        });
      }

      req.user = {
        userId: user._id,
        role: user.role,
        businessId: null,
      };

      return next();
    }

    // ======================================
    // BUSINESS USERS
    // ======================================
    if (!user.businessId) {
      return res.status(403).json({
        success: false,
        message: "This account is not assigned to a business.",
      });
    }

    // ======================================
    // CHECK BUSINESS STATUS
    // ======================================
    const business = await Business.findById(user.businessId);

    if (!business) {
      return res.status(403).json({
        success: false,
        message: "This business no longer exists.",
      });
    }

    if (!business.active) {
      return res.status(403).json({
        success: false,
        message: "This business is inactive.",
      });
    }

    // ======================================
    // CHECK ACCOUNT STATUS
    // ======================================
    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: "This account is inactive.",
      });
    }

    // ======================================
    // ATTACH CURRENT USER
    // ======================================
    req.user = {
      userId: user._id,
      role: user.role,
      businessId: user.businessId,
    };

    next();
  } catch (error) {
    // ======================================
    // TOKEN ERRORS
    // ======================================
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

export default authMiddleware;