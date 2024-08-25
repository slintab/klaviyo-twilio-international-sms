exports.handler = async (context, event, callback) => {
  // Prepare a new Twilio response for the incoming request
  const response = new Twilio.Response();

  // Extract payload
  const { request, recipient_phone_number, message } = event;

  // Check if payload has all data
  if (!(recipient_phone_number && message && request)) {
    return callback(null, setBadRequest(response));
  }

  // Check if authentication provided is correct
  if (!isAuthorized(request, context)) {
    return callback(null, setUnauthorized(response));
  }

  try {
    const result = await sendMessage(recipient, message, context);
    callback(null, `Message sent successfully with SID:${result.sid}`);
  } catch (e) {
    console.log(`There has been an error: ${e}`);
    callback(e);
  }
};

// Helper function to format the response as a 401 Unauthorized response
function setUnauthorized(response) {
  response
    .setBody("Unauthorized")
    .setStatusCode(401)
    .appendHeader("WWW-Authenticate", 'Basic realm="Authentication Required"');
  return response;
}

// Helper function to format the response as a 400 BadRequest response
function setBadRequest(response) {
  response.setBody("Bad request").setStatusCode(400);
  return response;
}

// Function for checking authentication headers
function isAuthorized(request, context) {
  const authHeader = request.headers?.authorization;

  if (!authHeader) return false;

  const [authType, credentials] = authHeader.split(" ");

  if (authType.toLowerCase() !== "basic") return false;

  const [username, password] = Buffer.from(credentials, "base64")
    .toString()
    .split(":");

  if (username !== context.AUTH_USERNAME || password !== context.AUTH_PASSWORD)
    return false;

  return true;
}

// Function for sending messages
async function sendMessage(recipient, message, context) {
  const twilioClient = context.getTwilioClient();
  const msg = {
    to: recipient,
    body: message,
    from: context.MESSAGING_SERVICE_SID,
  };

  const result = await twilioClient.messages.create(msg);

  return result;
}
