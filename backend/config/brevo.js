const { BrevoClient } = require('@getbrevo/brevo');

// Initialize the Brevo client
let client;
if (process.env.BREVO_API_KEY) {
  client = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
  });
}

/**
 * Sends a transactional OTP email to a user using Brevo
 * @param {string} email - Destination email address
 * @param {string} otp - 6-digit verification code
 * @param {string} purpose - The purpose of validation (e.g. registration, password_reset)
 * @returns {Promise}
 */
const sendOtpEmail = async (email, otp, purpose) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not set in .env");
  }

  if (!client) {
    client = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY,
    });
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "पंडितजी Services";

  if (!senderEmail) {
    throw new Error("BREVO_SENDER_EMAIL is not set in .env");
  }

  // Format purpose string nicely
  const purposeText = purpose === "registration" ? "Registration Verification" : "Password Reset";

  const emailPayload = {
    subject: `Your OTP Code for ${purpose === "registration" ? "Registration" : "Password Reset"}`,
    sender: { name: senderName, email: senderEmail },
    to: [{ email: email }],
    htmlContent: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #EAD9CC; border-radius: 12px; background-color: #FAF7F2; color: #7B1D0E;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #7B1D0E; font-size: 24px; margin: 0; font-family: Georgia, serif;">पंडितजी</h1>
          <p style="color: #E8710A; font-size: 14px; margin: 4px 0 0; font-weight: bold; letter-spacing: 0.05em;">SACRED RITUALS & SERVICES</p>
        </div>
        <div style="background-color: #FFFFFF; padding: 24px; border-radius: 8px; border: 1px solid #EAD9CC; box-shadow: 0 4px 12px rgba(123, 29, 14, 0.02);">
          <h2 style="color: #7B1D0E; font-size: 18px; margin-top: 0; text-align: center;">One-Time Password (OTP)</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #4A4A4A; text-align: center; margin-bottom: 24px;">
            Use the verification code below to complete your <strong>${purposeText}</strong>. This code is valid for 10 minutes.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #E8710A; background-color: #FFF3E8; padding: 12px 24px; border-radius: 8px; border: 1px dashed #E8710A; display: inline-block;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 12px; line-height: 1.5; color: #8C8C8C; text-align: center; margin-top: 24px;">
            If you did not request this code, please ignore this email.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #A0A0A0;">
          OTP powered by Brevo · Secure verification for पंडितजी Accounts
        </div>
      </div>
    `
  };

  return await client.transactionalEmails.sendTransacEmail(emailPayload);
};

module.exports = { sendOtpEmail };
