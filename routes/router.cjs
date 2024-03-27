const Router = require("express").Router;
const { tokenGenerator, voiceResponse } = require("./token.cjs");

const router = new Router();

router.get("/token", (req, res) => {
  const { identity, token } = tokenGenerator(); // Generate token and identity
  res.json({ identity, token }); // Send JSON response with identity and token
});

router.post("/voice", (req, res) => {
  const twiml = voiceResponse(req.body); // Generate TwiML response
  res.set("Content-Type", "text/xml");
  res.send(twiml.toString()); // Send TwiML response
});

module.exports = router;
