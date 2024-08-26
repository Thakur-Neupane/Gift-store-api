//Email workflow;
// have nodemailer installed
// create Transporter
// Form the body message
//sendMail

import nodemailer from "nodemailer";

const emailProcessor = async (mailBodyObj) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SEVER,
      port: 587,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const info = await transporter.sendMail(mailBodyObj);
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.log(error);
  }
};

// async..await is not allowed in global scope, must use a wrapper
export const emailVerificationMail = ({ email, fName, url }) => {
  const obj = {
    from: `"Tech Store 👻" <${process.env.SMTP_EMAIL}>`, // sender address
    to: email, // list of receivers
    subject: "Action Required", // Subject line
    text: `hellow there, pelase follow the link to verify you account ${url}`, // plain text body
    html: `
    Hello ${fName},
<br />
<br />

<p>
    Click the button bellow to verify your email
   </p> 

   <br />
   <a href="${url}" style="padding: 2rem; background: green"> Verify Now
   </a>


<p>
If the button desn't work above, Pelase copy the following url and paste in your browser
${url}
</p>
<br />
<br />
<p>
Regards, <br />
Tech Store
</p>


    `, // html body
  };

  emailProcessor(obj);
};

// send OTP for password
export const sendOTPMail = ({ email, fName, token }) => {
  const obj = {
    from: `"Tech Store" <${process.env.SMTP_EMAIL}>`, // sender address
    to: email, // list of receivers
    subject: "OTP for reset password", // Subject line
    text: `hellow there, Here is your OTP =  ${token}`, // plain text body
    html: `
    Hello ${fName},
<br />
<br />

<p>
   Here is your OTP
   </p> 

   <br />
   <div  style="font-size: 2rem; font-weight: bolder;"> ${token}
   </div>


<p>
If you didn't request your otp to reset your password, Please don't share this code with anybody.
</p>
<br />
<br />
<p>
Regards, <br />
Tech Store
</p>


    `, // html body
  };

  emailProcessor(obj);
};

// Account update changed email notification
export const accountUpdatedNotification = ({ email, fName }) => {
  const obj = {
    from: `"Tech Store" <${process.env.SMTP_EMAIL}>`, // sender address
    to: email, // list of receivers
    subject: "Your account has been updated", // Subject line
    text: `hellow there, somebody just updated your account, if that's not you, pelase change your password and contact us asap`, // plain text body
    html: `
    Hello ${fName},
<br />
<br />

<p>
somebody just updated your account, if that's not you, please change your password and contact us asap
   </p> 

   <br />
  

 
<br />
<br />
<p>
Regards, <br />
Tech Store
</p>


    `, // html body
  };

  emailProcessor(obj);
};
