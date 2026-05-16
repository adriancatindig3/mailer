// netlify/functions/sendMail.js
import { sendEmailToOwner, sendEmailToVisitor } from "./mailer.js";

export const handler = async (event) => {
  try {
    const {
      visitorEmail,
      visitorName,
      visitorCompany,
      visitorPhone,
      visitorMessage,
      ownerEmail,
      ownerName,
    } = JSON.parse(event.body);

    // Validate required fields
    if (!visitorEmail || !ownerEmail || !visitorMessage || !visitorName) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing required fields",
        }),
      };
    }

    // Send email to OWNER with all visitor details
    await sendEmailToOwner(
      ownerEmail,
      ownerName,
      visitorEmail,
      visitorMessage,
      visitorName,
      visitorCompany,
      visitorPhone,
    );

    // In netlify/functions/sendMail.js
    // Send confirmation email to VISITOR with ALL their data
    await sendEmailToVisitor(
      visitorEmail,
      visitorName,
      visitorCompany,
      visitorPhone,
      visitorMessage,
      ownerName,
    );
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Messages sent successfully",
      }),
    };
  } catch (err) {
    console.error("Email error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
