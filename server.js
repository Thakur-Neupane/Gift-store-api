import express from "express";
import cookieSession from "cookie-session";

const app = express();
const PORT = process.env.PORT || 8001;

// db connect
import { connectDb } from "./src/config/dbConfig.js";
connectDb();

//middlewares
import cors from "cors";
import morgan from "morgan";

app.use(
  cors({
    origin: process.env.FE_ROOT_URL,
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("tiny"));

// apis
import routers from "./src/routers/routers.js";

routers.forEach(({ path, middlewares }) => app.use(path, ...middlewares));

// ErrorHandler

app.get("/", (req, res, next) => {
  res.json({
    status: "success",
    message: "server is live",
  });
});

app.use("*", (req, res, next) => {
  const err = new Error("404 Page not found");
  err.statusCode = 404;
  next(err);
});

app.use((error, req, res, next) => {
  res.status(error.statusCode || 500);
  res.json({
    status: "error",
    message: error.message,
  });
});

app.listen(PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`Server running at http://localhost:${PORT}`);
});
