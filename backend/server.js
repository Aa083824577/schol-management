const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const morgan = require("morgan");
const winston = require("winston");

const app = express();
// middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhose:27017/schol-gestion",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
  .then(() => console.log("connected to mongodb"))
  .catch((err) => console.log("mongo connection error : ", err));

// winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({
      filename: "error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "combined.log",
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ],
});

app.use(
    morgan(":methode : url : status : response-time ms - : res[content-length]")
)
// api logger middlware
const apilogger = (req,res,next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            methode : req.methode,
            path: req.path,
            status : res.statusCode,
            duration: `${duration}ms`,
            parms: req.parms,
            query: req.query,
            body: req.methode !== 'GET' ? req.body : undefined
        });
    });
    next();
}