import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import urlRoutes from "./routes/url.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { redirectUrl } from "./controllers/url.controller.js";

const app = express();
// Middleware
app.use(express.json());

//  app.use(cors({
//   origin: process.env.FRONTEND_URL
// })); 
app.use(cors());  


// DB
connectDB();

// Health check (must be before /:shortCode wildcard)
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/url", urlRoutes);

// Redirect short URLs — keep LAST so it doesn't swallow API routes
app.get("/:shortCode", redirectUrl);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});