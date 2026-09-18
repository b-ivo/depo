const requireBusinessUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (!req.user.businessId) {
    return res.status(403).json({
      success: false,
      message: "This account cannot access business operational data.",
    });
  }

  next();
};

export default requireBusinessUser;
