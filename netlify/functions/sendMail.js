import { sendMail } from "./mailer.js";

export const handler = async (event) => {
  try {
    const { recipient, message } = JSON.parse(event.body);

    if (!recipient || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing recipient or message" })
      };
    }

    await sendMail(
      recipient,
      "Message from App",
      message
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};