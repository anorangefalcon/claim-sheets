import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

// For Vercel, we export the app
export default app;

// For local development, start the server
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`[server]: running on port ${PORT}`);
  });
}
