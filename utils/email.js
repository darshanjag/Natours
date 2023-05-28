const nodemailer = require('nodemailer');


const sendEmail = async options =>{
    //create a transporter
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "0b13f29a40f8b5",
          pass: "c8caafd56bbd0f"
        }
    })
    //define the email options
    const mailOptions = {
        from:'darshan <itsdarshanjagtap@gmail.com>',
        to:options.email,
        subject:options.subject,
        text:options.message,
        // html:
     

    }
    //send the email with nodemailer
    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail;