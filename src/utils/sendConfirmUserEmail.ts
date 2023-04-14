import * as nodemailer from 'nodemailer';

export const sendConfirmUserEmail = async (email: string, link: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Quang Ho" <quang.ho.dev@gmail.com>', // sender address
    to: email, // list of receivers
    subject: 'User confirmation email', // Subject line
    text: 'User confirmation email', // plain text body
    html: `<b>Hello new user, please click this link </b> <a href="${link}">confirm Email</a> to confirm your account.`, // html body
  });

  console.log('Message sent: %s', info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
};
