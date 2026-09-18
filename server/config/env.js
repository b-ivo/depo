const MIN_SECRET_LENGTH = 32;

const WEAK_SECRET_VALUES = [
  "your-long-random-secret-key",
  "changeme",
  "secret",
  "jwtsecret",
  "jwt-secret",
];

const validateEnv = () => {
  const errors = [];

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    errors.push("MONGO_URI (or MONGODB_URI) is not set.");
  } else {
    process.env.MONGO_URI = mongoUri;
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    errors.push("JWT_SECRET is not set.");
  } else if (jwtSecret.length < MIN_SECRET_LENGTH) {
    errors.push(
      `JWT_SECRET is too short. It must be at least ${MIN_SECRET_LENGTH} characters.`,
    );
  } else if (WEAK_SECRET_VALUES.includes(jwtSecret.trim().toLowerCase())) {
    errors.push(
      "JWT_SECRET is a known placeholder value. Generate a strong random secret.",
    );
  }

  if (errors.length > 0) {
    console.error("Invalid environment configuration:");
    errors.forEach((message) => console.error(` - ${message}`));
    console.error(
      'Generate a strong secret with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"',
    );
    process.exit(1);
  }

  console.log("Environment configuration validated.");
};

export default validateEnv;
