import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/api.js";
import externalRoutes from "./routes/external.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);
app.use("/api", externalRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
