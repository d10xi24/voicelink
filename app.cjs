/*
 * app.cjs
 * 
 * Copyright 2024 dion <dion@levatine>
 *
 *      ____   ____      _                 __  _           __       
 *     |_  _| |_  _|    (_)               [  |(_)         [  | _ 
 *       \\ \\   / /.--. __  .---.  .---.  | | __  _ .--.  |  / ]  
 *        \\ \\ / / .'\\[  |/ /'\\ ] /__\\ | |[  |[  .-. | | ''<  
 *         \\ ' /| \\__.|  || \\__.| \\__. | | | | | | | | | |'\ \  
 *          \\_/  '.__.'[__]'.___.''.__.' [___|___|___||__|__|  \_] 
 *
 */


const http = require("http");
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { createLogger, transports, format } = require('winston');
const { combine, timestamp, label, printf } = format;

require('dotenv').config(); 

const router = require("./routes/router.cjs");

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(router);

app.use((req, res, next) => {
  if (req.url.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript');
  }
  next();
});

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

const logDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

// Create a logger instance
const logger = createLogger({
  format: combine(
    label({ label: 'server' }),
    timestamp(),
    logFormat
  ),
  transports: [
    // Log errors to a file
    new transports.File({ filename: path.join(logDirectory, 'error.log'), level: 'error' }),
    // Log debug messages to a file
    new transports.File({ filename: path.join(logDirectory, 'debug.log'), level: 'debug' })
  ]
});

// Log errors to console
if (process.env.NODE_ENV !== 'prod') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      logFormat
    )
  }));
}

const server = http.createServer(app);
const port = process.env.PORT || 1337;

server.listen(port, function () {
  console.log(`Server is running on http://127.0.0.1:${port}`);

});

