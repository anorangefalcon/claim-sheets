const app = require("./app");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// For local development, start the server
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  });
}

// Export for Vercel (still needed even for traditional server on Vercel)
module.exports = app;
