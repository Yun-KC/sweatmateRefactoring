const { body, validationResult } = require("express-validator");

module.exports = {
  validateBodyForSignup: () => {
    return [
      [
        body("email").notEmpty().isEmail(),
        body("nickname").notEmpty(),
        body("password").notEmpty(),
      ],
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ message: "Incorrect format" });
        }
        next();
      },
    ];
  },
};
