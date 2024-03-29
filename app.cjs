/*
 *      ____   ____      _                 __  _           __
 *     |_  _| |_  _|    (_)               [  |(_)         [  | _
 *       \\ \\   / /.--. __  .---.  .---.  | | __  _ .--.  |  / ]
 *        \\ \\ / / .'\\[  |/ /'\\ ] /__\\ | |[  |[  .-. | | ''<
 *         \\ ' /| \\__.|  || \\__.| \\__. | | | | | | | | | |'\ \
 *          \\_/  '.__.'[__]'.___.''.__.' [___|___|___||__|__|  \_]
 *
 *
 * MIT License
 *
 * Copyright (c) 2024 dion@levatine
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const { createLogger, transports, format } = require("winston");
const { combine, timestamp, label, printf } = format;

// Load environment variables from the .env file
require("dotenv").config();

// Import router module for routing
const router = require("./routes/router.cjs");

// Create an Express application
const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Parse request bodies as JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Use the router for handling routes
app.use(router);

// Set content type as 'application/javascript' for JavaScript files
app.use((req, res, next) => {
  if (req.url.endsWith(".js")) {
    res.setHeader("Content-Type", "application/javascript");
  }
  next();
});

// Set view engine as EJS
app.set("view engine", "ejs");

// Render the index page for the root URL
app.get("/", (req, res) => {
  res.render("index");
});

// Create a directory for logs if it doesn't exist
const logDirectory = path.join(__dirname, "logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Define log format for Winston logger
const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

// Create a logger instance
const logger = createLogger({
  format: combine(label({ label: "server" }), timestamp(), logFormat),
  transports: [
    // Log errors to a file
    new transports.File({
      filename: path.join(logDirectory, "error.log"),
      level: "error",
    }),
    // Log debug messages to a file
    new transports.File({
      filename: path.join(logDirectory, "debug.log"),
      level: "debug",
    }),
  ],
});

// Log errors to console in non-production environments
if (process.env.NODE_ENV !== "prod") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), logFormat),
    })
  );
}

// Create an HTTP server with the Express app
const server = http.createServer(app);

// Define the port number to listen on, defaulting to 1337
const port = process.env.PORT || 1337;

// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://127.0.0.1:${port}`);
});
