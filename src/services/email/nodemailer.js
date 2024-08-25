import nodemailer from "nodemailer";

// Create a transport object using your SMTP server details
const emailProcessor = async (mailBodyObj) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SEVER,
      port: 587,
      secure: false, // true for port 465, false for all other ports
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const info = await transporter.sendMail(mailBodyObj);
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Function to send email verification link
export const emailVerificationMail = ({ email, fName, token }) => {
  const url = `${process.env.FE_ROOT_URL}/verify-email?c=${token}&e=${email}`;
  const obj = {
    from: `"Tech Store" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "Email Verification",
    text: `Hello ${fName}, please follow the link to verify your account: ${url}`,
    html: `
      <p>Hello ${fName},</p>
      <p>Please click the button below to verify your email address:</p>
      <a href="${url}" style="padding: 10px 20px; background-color: green; color: white; text-decoration: none; border-radius: 5px;">Verify Now</a>
      <p>If the button doesn't work, copy and paste the following URL into your browser:</p>
      <p>${url}</p>
      <p>Regards,<br>Tech Store</p>
    `,
  };

  emailProcessor(obj);
};

// Function to send OTP for password reset
export const sendOTPMail = ({ email, fName, token }) => {
  const obj = {
    from: `"Tech Store" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "OTP for Password Reset",
    text: `Hello ${fName}, Here is your OTP: ${token}`,
    html: `
      <p>Hello ${fName},</p>
      <p>Here is your OTP for resetting your password:</p>
      <div style="font-size: 2rem; font-weight: bold;">${token}</div>
      <p>If you did not request a password reset, please disregard this email.</p>
      <p>Regards,<br>Tech Store</p>
    `,
  };

  emailProcessor(obj);
};

// Function to send account update notification
export const accountUpdatedNotification = ({ email, fName }) => {
  const obj = {
    from: `"Tech Store" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "Account Updated",
    text: `Hello ${fName}, your account has been updated. If this wasn't you, please change your password and contact us immediately.`,
    html: `
      <p>Hello ${fName},</p>
      <p>Someone just updated your account. If this wasn't you, please change your password and contact us immediately.</p>
      <p>Regards,<br>Tech Store</p>
    `,
  };

  emailProcessor(obj);
};
