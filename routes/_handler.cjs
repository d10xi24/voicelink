const VoiceResponse = require("twilio").twiml.VoiceResponse;
const AccessToken = require("twilio").jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;
const nameGenerator = require("../util.cjs");
const config = require("../config.cjs");

var identity;

exports.tokenGenerator = function tokenGenerator(identity) {
    if (!identity) {
        identity = nameGenerator();
        if (!identity) {
            throw new Error("Identity is required but not provided.");
        }
    } else {
        if (!identity.trim()) {
            throw new Error("Identity is required but not provided.");
        }
    }
    const accessToken = new AccessToken(config.accountSid, config.apiKey, config.apiSecret, { ttl: 3600, identity: identity });
    accessToken.identity = identity;
    const grant = new VoiceGrant({ outgoingApplicationSid: config.twimlAppSid, incomingAllow: !0 });
    accessToken.addGrant(grant);
    return { identity: identity, token: accessToken.toJwt() };
};
exports.voiceResponse = function voiceResponse(requestBody) {
    const toNumberOrClientName = requestBody.To;
    const callerId = config.callerId;
    let twiml = new VoiceResponse();
    if (toNumberOrClientName == callerId) {
        let dial = twiml.dial();
        dial.client(identity);
    } else if (requestBody.To) {
        let dial = twiml.dial({ callerId });
        const attr = isAValidPhoneNumber(toNumberOrClientName) ? "number" : "client";
        dial[attr]({}, toNumberOrClientName);
    } else {
        twiml.say("Thanks for using Voicelink!");
    }
    return twiml.toString();
};
function isAValidPhoneNumber(number) {
    return /^[\d\+\-\(\) ]+$/.test(number);
}
