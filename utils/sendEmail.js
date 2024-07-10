import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  // 1) create a transporter (Service that will send email like "gmail" , "Mailgun" , "SendGrid" , "sendGrid")
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, // if secure false port = 587 , if secure true port = 465
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // 2) define the email options
  const emailOptions = {
    from: `E-shop App <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3) send the email
  await transporter.sendMail(emailOptions);
  // 4) log the email and message
};
