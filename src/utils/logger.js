const winston = require("winston");

// error (0) - For errors that need immediate attention.
// warn (1) - For potentially harmful situations or warnings.
// info (2) - For general informational messages.
// http (3) - For HTTP-related messages (often used in web applications).
// verbose (4) - For detailed information for diagnostic purposes.
// debug (5) - For debugging messages that help in troubleshooting.
// silly (6) - For very low-priority logs, used for verbose tracing.

const logger = winston.createLogger({
  level: "silly",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()],
});

module.exports = logger;
