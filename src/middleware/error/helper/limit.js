import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    res.status(429).json({
      error: "Too many requests made",
      message: "You have exceeded the rate limit. please try again later",
      standardHeaders: true,
      legacyHeaders: false,
    });
  },
});
