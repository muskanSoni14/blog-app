console.log("--- SERVER STARTING WITH LATEST CODE (v3) ---");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const colors = require("colors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

//env config
dotenv.config();

//router import
const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");

//mongodb connection
connectDB();

//rest objecct
const app = express();

//middelwares
// 1. Define your "whitelist" of allowed URLs
const allowedOrigins = [
  'http://localhost:3000',
  'https://blogapp-vert-two.vercel.app' // Your deployed frontend URL
];

// 2. Create the CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow if the origin is in our whitelist
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

// 3. Use the new options in your app
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

//routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/blog", blogRoutes);

// Port
const PORT = process.env.PORT || 8080;
//listen
app.listen(PORT, () => {
  console.log(
    `Server Running on ${process.env.DEV_MODE} mode port no ${PORT}`.bgCyan
      .white
  );
});
