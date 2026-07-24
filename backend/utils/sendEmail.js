const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html, text }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      const mailOptions = {
        from: `"MirrorTalk" <${emailUser}>`,
        to,
        subject,
        html,
        text,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✉️ Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error("❌ Nodemailer send error:", err.message);
      return { success: false, error: err.message };
    }
  } else {
    console.log(`\n==================================================`);
    console.log(`✉️ [EMAIL DISPATCH SIMULATION]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    console.log(`⚠️ NOTE: Set EMAIL_USER & EMAIL_PASS in backend/.env for live Gmail delivery.`);
    console.log(`==================================================\n`);
    return { success: true, simulated: true };
  }
};

module.exports = sendEmail;
