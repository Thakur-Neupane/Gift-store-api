import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDb } from "./src/config/dbConfig.js";
import routers from "./src/routers/routers.js";

const app = express();
const PORT = process.env.PORT || 8001;

// Connect to the database
connectDb();

// CORS configuration
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:5173",
  "http://localhost:5174",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET, POST, PUT, DELETE, PATCH",
  credentials: true,
};

app.use(cors(corsOptions));

// Middlewares
app.use(express.json());
app.use(morgan("tiny"));

// Register API routes
routers.forEach(({ path, middlewares }) => app.use(path, ...middlewares));

// Health Check
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Server is live",
  });
});

// Handle 404 - Page Not Found
app.use("*", (req, res, next) => {
  const err = new Error("404 Page not found");
  err.statusCode = 404;
  next(err);
});

// Error Handler
app.use((error, req, res, next) => {
  console.error(error.stack); // Log stack trace for debugging
  res.status(error.statusCode || 500).json({
    status: "error",
    message: error.message,
  });
});

// Start the server
app.listen(PORT, (error) => {
  if (error) {
    console.error("Failed to start the server:", error);
  } else {
    console.log(`Server running at http://localhost:${PORT}`);
  }
});
