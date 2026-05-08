import { sendMail } from "../../mailer.js";

export const handler = async (event) => {
  const { to, subject, message } = JSON.parse(event.body);

  await sendMail(to, subject, message);

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};