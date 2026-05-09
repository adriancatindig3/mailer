import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendMail = async (to, subject, message) => {
  await transporter.sendMail({
    from: `Mailer App <${process.env.EMAIL_USER}>`,
    to,
    subject,

    // fallback plain text
    text: message,

    // premium HTML email
    html: `
      <div style="
        margin:0;
        padding:40px;
        background:#f3f4f6;
        font-family: Arial, sans-serif;
      ">

        <!-- Card container -->
        <div style="
          max-width:600px;
          margin:0 auto;
          background:#ffffff;
          border:2px solid #d1d5db;
          border-radius:12px;
          overflow:hidden;
        ">

          <!-- Header -->
          <div style="
            background:#111827;
            padding:22px;
            text-align:center;
            color:#ffffff;
          ">
            <h1 style="margin:0;font-size:18px;">
              📩 New Messageeeeeeeeeee
            </h1>
          </div>

          <!-- Body -->
          <div style="padding:28px;">

            <p style="
              font-size:13px;
              color:#6b7280;
              margin-bottom:16px;
            ">
              You’ve received a message:
            </p>

            <!-- Message box -->
            <div style="
              background:#f9fafb;
              border:1px solid #e5e7eb;
              border-left:5px solid #6366f1;
              padding:18px;
              border-radius:10px;
              font-size:15px;
              color:#111827;
              line-height:1.6;
              white-space:pre-wrap;
            ">
              ${message}
            </div>

            <div style="
              margin:24px 0;
              height:1px;
              background:#e5e7eb;
            "></div>

            <p style="
              font-size:12px;
              color:#9ca3af;
              text-align:center;
            ">
              Secure automated email from Mailer App
            </p>

          </div>

          <!-- Footer -->
          <div style="
            background:#f9fafb;
            padding:14px;
            text-align:center;
            font-size:11px;
            color:#9ca3af;
            border-top:1px solid #e5e7eb;
          ">
            © ${new Date().getFullYear()} Mailer App
          </div>

        </div>
      </div>
    `
  });
};