import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/api.js";
import externalRoutes from "./routes/external.js";

// Load environment variables from .env file
dotenv.config();

// Create an express application
const app = express();
const PORT = process.env.PORT;
// express.json() is a middleware that parses incoming requests with JSON payloads
app.use(express.json());

// Routes are defined in the routes folder
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);
app.use("/api", externalRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
