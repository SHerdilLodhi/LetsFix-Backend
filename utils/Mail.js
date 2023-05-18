const nodemailer=require("nodemailer");

async function sendMail({from,to,subject,text,html}){
    
   try {

    let transporter=nodemailer.createTransport({
        host:"smtp-relay.sendinblue.com",
        port:587,
        secure:false,
        auth:{user:"lodhisherdil1@gmail.com",
            pass:"hVU3HSdZ4r9yWpGw"}
    });

    let info=await transporter.sendMail({from:`Lets Fix <${from}>`,to,subject,text,html})

   } catch (error) {
        console.log(error);
   }

}

module.exports=sendMail