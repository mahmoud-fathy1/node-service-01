import nodemailer from 'nodemailer';
const sendMail = async ({
  to,
  from = process.env.EMAIL,
  text,
  html,
  cc,
  bcc,
  attachments = [],
  subject
} = {}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    }
  });
  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
    cc,
    bcc,
    attachments
  });
  if (info.accepted.length) {
    return true;
  }
  return false;
};
export default sendMail;