import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email to the PROFILE OWNER (dynamic email from Firebase)
export const sendEmailToOwner = async (ownerEmail, ownerName, visitorEmail, visitorMessage, visitorName, visitorCompany, visitorPhone) => {
  await transporter.sendMail({
    from: `e-CARD <${process.env.EMAIL_USER}>`,
    to: ownerEmail,
    subject: `New Connection Request from ${visitorName}`,
    
    text: `You have received a new connection request via e-CARD\n\nFrom: ${visitorName}\nEmail: ${visitorEmail}\nCompany: ${visitorCompany || 'Not provided'}\nPhone: ${visitorPhone || 'Not provided'}\n\nMessage:\n${visitorMessage}\n\nReply directly to ${visitorEmail} to connect.`,
    
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>e-CARD Connection Request</title>
      </head>
      <body style="margin: 0; padding: 0; background: #f0f2f5; font-family: 'Segoe UI', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f0f2f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1a472a 0%, #0d2818 100%); padding: 30px; text-align: center;">
                    <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: bold; color: #ffffff;">e-CARD</h1>
                    <p style="margin: 0; font-size: 14px; color: #a8e6cf; letter-spacing: 1px;">Digital Business Card</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 35px 30px;">
                    <h2 style="margin: 0 0 10px 0; font-size: 22px; color: #1a472a;">New Connection Request</h2>
                    <p style="margin: 0 0 25px 0; font-size: 15px; color: #555555; line-height: 1.5;">
                      Someone wants to connect with you through your e-CARD profile!
                    </p>
                    
                    <!-- Visitor Info Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f8f9fa; border-radius: 15px; margin-bottom: 25px;">
                      <tr>
                        <td style="padding: 20px;">
                          <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #2c5f2d; border-left: 3px solid #2c5f2d; padding-left: 12px;">Visitor Information</h3>
                          <table width="100%" cellpadding="8" cellspacing="0">
                            <tr>
                              <td width="30%" style="font-size: 13px; color: #666; font-weight: 600;">Name:</td>
                              <td style="font-size: 14px; color: #333;">${visitorName}</td>
                            </tr>
                            <tr>
                              <td style="font-size: 13px; color: #666; font-weight: 600;">Email:</td>
                              <td style="font-size: 14px; color: #333;"><a href="mailto:${visitorEmail}" style="color: #2c5f2d; text-decoration: none;">${visitorEmail}</a></td>
                            </tr>
                            ${visitorCompany ? `
                            <tr>
                              <td style="font-size: 13px; color: #666; font-weight: 600;">Company:</td>
                              <td style="font-size: 14px; color: #333;">${visitorCompany}</td>
                            </tr>
                            ` : ''}
                            ${visitorPhone ? `
                            <tr>
                              <td style="font-size: 13px; color: #666; font-weight: 600;">Phone:</td>
                              <td style="font-size: 14px; color: #333;">${visitorPhone}</td>
                            </tr>
                            ` : ''}
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Message Box -->
                    <div style="background: #f0f7f0; border-left: 4px solid #2c5f2d; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                      <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Message</p>
                      <p style="margin: 0; font-size: 15px; color: #333; line-height: 1.6;">${visitorMessage.replace(/\n/g, '<br>')}</p>
                    </div>
                    
                    <!-- Action Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="padding: 10px 0;">
                          <a href="mailto:${visitorEmail}" style="display: inline-block; background: linear-gradient(135deg, #1a472a 0%, #2c5f2d 100%); color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 50px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 8px rgba(26,71,42,0.3);">Reply to ${visitorName}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0 0 5px 0; font-size: 12px; color: #888;">Sent via e-CARD Digital Business Card</p>
                    <p style="margin: 0; font-size: 11px; color: #aaa;">This is an automated message from e-CARD platform</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  });
};

// Send confirmation email to the VISITOR (with ALL submitted data - same design as owner)
export const sendEmailToVisitor = async (visitorEmail, visitorName, visitorCompany, visitorPhone, visitorMessage, ownerName) => {
  await transporter.sendMail({
    from: `e-CARD <${process.env.EMAIL_USER}>`,
    to: visitorEmail,
    subject: `Your Connection Request to ${ownerName} - Confirmation`,
    
    text: `Hello ${visitorName}! 👋\n\nThank you for connecting with ${ownerName} via e-CARD.\n\nHere's a summary of your request:\n\nName: ${visitorName}\nEmail: ${visitorEmail}\nCompany: ${visitorCompany || 'Not provided'}\nPhone: ${visitorPhone || 'Not provided'}\n\nYour Message:\n"${visitorMessage}"\n\n${ownerName} will respond to you directly at this email address.\n\nBest regards,\ne-CARD Team`,
    
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>e-CARD - Your Connection Request</title>
      </head>
      <body style="margin: 0; padding: 0; background: #f0f2f5; font-family: 'Segoe UI', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f0f2f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1a472a 0%, #0d2818 100%); padding: 30px; text-align: center;">
                    <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: bold; color: #ffffff;">e-CARD</h1>
                    <p style="margin: 0; font-size: 14px; color: #a8e6cf; letter-spacing: 1px;">Digital Business Card</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 35px 30px;">
                    <h2 style="margin: 0 0 10px 0; font-size: 22px; color: #1a472a;">Your Connection Request</h2>
                    <p style="margin: 0 0 25px 0; font-size: 15px; color: #555555; line-height: 1.5;">
                      Thank you for reaching out! Here's a summary of your request sent to <strong>${ownerName}</strong>.
                    </p>
                    
                    <!-- Your Information Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f8f9fa; border-radius: 15px; margin-bottom: 25px;">
                      <tr>
                        <td style="padding: 20px;">
                          <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #2c5f2d; border-left: 3px solid #2c5f2d; padding-left: 12px;">Your Information</h3>
                          <table width="100%" cellpadding="8" cellspacing="0">
                            <tr>
                              <td width="30%" style="font-size: 13px; color: #666; font-weight: 600;">Name:</td>
                              <td style="font-size: 14px; color: #333;">${visitorName}</td>
                            </tr>
                            <tr>
                              <td style="font-size: 13px; color: #666; font-weight: 600;">Email:</td>
                              <td style="font-size: 14px; color: #333;">${visitorEmail}</td>
                            </tr>
                            ${visitorCompany ? `
                            <tr>
                              <td style="font-size: 13px; color: #666; font-weight: 600;">Company:</td>
                              <td style="font-size: 14px; color: #333;">${visitorCompany}</td>
                            </tr>
                            ` : ''}
                            ${visitorPhone ? `
                            <tr>
                              <td style="font-size: 13px; color: #666; font-weight: 600;">Phone:</td>
                              <td style="font-size: 14px; color: #333;">${visitorPhone}</td>
                            </tr>
                            ` : ''}
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Your Message Box -->
                    <div style="background: #f0f7f0; border-left: 4px solid #2c5f2d; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                      <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Your Message</p>
                      <p style="margin: 0; font-size: 15px; color: #333; line-height: 1.6;">${visitorMessage.replace(/\n/g, '<br>')}</p>
                    </div>
                    
                    <!-- Info Box -->
                    <div style="background: #e8f5e9; border-radius: 12px; padding: 20px; margin-top: 20px;">
                      <p style="margin: 0 0 8px 0; font-size: 13px; color: #2c5f2d; font-weight: 600;">💡 What happens next?</p>
                      <p style="margin: 0; font-size: 13px; color: #444; line-height: 1.5;">
                        ${ownerName} will review your request and reach out to you directly at <strong>${visitorEmail}</strong>. 
                        They have all your contact information to respond.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0 0 5px 0; font-size: 12px; color: #888;">Thank you for using e-CARD</p>
                    <p style="margin: 0; font-size: 11px; color: #aaa;">Your digital business card platform</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  });
};