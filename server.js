const express = require('express');
const nodemailer = require('nodemailer');
const morgan = require("morgan")
require("dotenv").config()
const cors = require("cors")
const crypto = require("crypto")
const userModel = require('./model');
const app = express();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose")
const port = 3000;
app.use(cors())
app.use(express.json());
app.use(morgan('dev'));

const validateEmail = (mail) => {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
    return true;
  } else {
    return false;
  }
};

const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'flavorfinder.app@gmail.com',
    pass: process.env.GMAIL_PASS
  }
});
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  const otp = crypto.randomInt(100000, 999999);

  const mailOptions = {
    from: 'flavorfinder.app@gmail.com',
    to: email,
    subject: "Veriy your email address",
    html: `<!DOCTYPE html>
    <html>
    <head>
      <title>OTP Verification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 16px;
          color: #333;
          line-height: 1.5;
          padding: 20px;
        }
        
        h1 {
          font-size: 24px;
          margin-bottom: 20px;
          color: #333;
        }
        
        p {
          margin-bottom: 20px;
        }
        
        .code {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        
        .btn {
          display: inline-block;
          background-color: #3498db;
          color: #fff;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
        }
        
        .btn:hover {
          background-color: #2980b9;
        }
      </style>
    </head>
    <body>
      <h1>OTP Verification</h1>
      <p>Thank you for signing up for our Flavor Finder App. To complete your registration, please use the following One-Time Password:</p>
      <div class="code">[${otp}]</div>
      <p>This code will expire in 5 minutes. If you did not sign up for this service, please ignore this email.</p>
    </body>
    </html>
    `
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.json(`Error ${error}`)
    } else {
      // console.log('Email sent: ' + info.response);
      res.json(otp)
    }
  });
})



app.post("/get-user", async (req, res) => {
  let { uId } = req.body;
  if (!uId) {
    return res.json({ error: "All fields are required!" });
  } else {
    try {
      let User = await userModel
        .findById(uId)
        .select("name email phoneNumber userImage updatedAt createdAt");
      if (User) {
        return res.json({ User });
      }
    } catch (err) {
      console.log(err);
    }
  }
})

app.get("/check-email", async (req, res) => {
  let { email } = req.body
  let userCheck = userModel.findOne({ email: email })
    .then((email) => {
      if (email) {
        res.json({ err: "Email already exists" })
      }
      else {
        res.json({ success: true })
      }

    })

})

app.post("/edit-user", async (req, res) => {
  let { uId, name, phoneNumber } = req.body;
  if (!uId || !name || !phoneNumber) {
    return res.json({ message: "All filled must be required" });
  } else {

    let currentUser = userModel.findByIdAndUpdate(uId, {
      name: name,
      phoneNumber: phoneNumber,
      updatedAt: Date.now(),
    })
      .then((result) => res.json({ success: "User updated successfully" }))
      .catch((err) => res.json({ err: err }))
  }
})

/* User Registration/Signup controller  */

app.post("/signup", async (req, res) => {
  let { name, email, password, phoneNumber } = req.body;
  let error = {};
  if (!name || !email || !password || !phoneNumber) {
    error = {
      ...error,
      name: "Filed must not be empty",
      email: "Filed must not be empty",
      password: "Filed must not be empty",
      phoneNumber: "Filed must not be empty",
    };
    return res.json({ error });
  }
  if (name.length < 3 || name.length > 25) {
    error = { ...error, name: "Name must be 3-25 charecter" };
    return res.json({ error });
  } else {
    if (validateEmail(email)) {
      name = toTitleCase(name);
      if ((password.length > 255) | (password.length < 8)) {
        error = {
          ...error,
          password: "Password must be 8 charecter",
          name: "",
          email: "",
        };
        return res.json({ error });
      } else {
        // If Email & Number exists in Database then:
        try {
          password = bcrypt.hashSync(password, 10);
          const data = await userModel.findOne({ email: email });
          if (data) {
            error = {
              ...error,
              password: "",
              name: "",
              email: "Email already exists",
            };
            return res.json({ error });
          } else {
            let newUser = new userModel({
              name,
              email,
              password,
              phoneNumber,
              userRole: 0,
            });

            newUser
              .save()
              .then((data) => {
                let mailOptions = {
                  from: 'flavorfinder.app@gmail.com',
                  to: email,
                  subject: 'Thank you for Registering!',
                  html: `<!DOCTYPE html>
                                <html lang="en">
                                  <head>
                                    <style>
                                      .container {
                                        border: 1px solid #ddd;
                                        border-radius: 5px;
                                        padding: 20px;
                                        max-width: 600px;
                                        margin: 0 auto;
                                      }
                                      
                                      .header {
                                        background-color: #f9f9f9;
                                        text-align: center;
                                        padding: 10px;
                                        border-radius: 5px;
                                      }
                                      
                                      .body {
                                        padding: 20px;
                                      }
                                      
                                      .button {
                                        display: inline-block;
                                        background-color: #4CAF50;
                                        color: white;
                                        padding: 10px 20px;
                                        text-align: center;
                                        text-decoration: none;
                                        border-radius: 5px;
                                        margin: 20px auto;
                                      }
                                      
                                    .center {text-align: center}
                                      .footer {
                                        text-align: center;
                                        margin-top: 20px;
                                      }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="container">
                                      <div class="header">
                                        <h1>Welcome to Flavor Finder App!</h1>
                                      </div>
                                      <div class="body">
                                        <p>Dear ${name},</p>
                                        <p>Thank you for registering with Flavor Finder App! We're excited to have you as a member of our community.</p>
                                        <p>With our app, you can search for and save your favorite recipes, share your own creations, and connect with other food enthusiasts from around the world.</p>
                                        <p>If you have any questions or need help getting started, please don't hesitate to reach out to our support team.</p>
                                        <div class="center" > 
                                        <p>Name: ${name}</p>
                                        <p>Email: ${email}</p>
                                        <p>Phone Number: ${phoneNumber}</p>
                                        </div>
                                        <p>Happy cooking!</p>
                                        <a href="mailto:flavorfinder.app@gmail.com" class="button">Contact Us</a>
                                      </div>
                                      <div class="footer">
                                        <p>Flavor Finder App | © 2023 All Rights Reserved</p>
                                      </div>
                                    </div>
                                  </body>
                                </html>
                                `
                };
                transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('Email sent: ' + info.response);
                  }
                });
                return res.json({
                  success: "Account create successfully. Please login",
                  data
                });
              })
              .catch((err) => {
                console.log(err);
              });
          }
        } catch (err) {
          console.log(err);
        }
      }
    } else {
      error = {
        ...error,
        password: "",
        name: "",
        email: "Email is not valid",
      };
      return res.json({ error });
    }
  }
})

/* User Login/Signin controller  */

app.post("/update-profile", async (req, res) => {
  let { uId, userImage } = req.body;
  if (!uId || !userImage) {
    return res.json({ message: "All filled must be required" });
  } else {

    let currentUser = userModel.findByIdAndUpdate(uId, {
      userImage: userImage,
      updatedAt: Date.now(),
    })
      .then((result) => res.json({ success: "User updated successfully" }))
      .catch((err) => res.json({ err: err }))
  }
})

app.post("/signin", async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    return res.json({
      error: "Fields must not be empty",
    });
  }
  try {
    const data = await userModel.findOne({ email: email });
    console.log(data)
    if (!data) {
      return res.json({
        error: "Invalid email or password",
      });
    } else {
      const login = await bcrypt.compare(password, data.password);
      if (login) {
        return res.json({ auth: true, data })
      } else {
        return res.json({
          error: "Invalid email or password",
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
})

mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

  .then(() =>
    console.log("==============Mongodb Database Connected Successfully==============")
  )
  .catch((err) => console.log("Database Not Connected !!!", err));

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
