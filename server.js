const express = require('express');
const morgan = require("morgan")
require("dotenv").config()
const cors = require("cors")
const app = express();
const mongoose = require("mongoose");
const userControler = require("./controlers/user.controler")
const recipeController = require("./controlers/recipe.controller")
const port = 3000;
app.use(cors())
app.use(express.json());
app.use(morgan('dev'));

// to send OTP
app.post("/send-otp", userControler.sendOTP)

// to get user details
app.post("/get-user", userControler.getUser)

app.post("/check-email", userControler.checkMail)

app.post("/edit-user", userControler.editUser)

// change Password
app.post("/change-password", userControler.changePassword)

/* User Registration/Signup controller  */
app.post("/signup", userControler.signup)

/* User Login/Signin controller  */
app.post("/update-profile", userControler.updateProfile)

// User signin
app.post("/signin", userControler.signin)

app.post("/add-recipes", recipeController.addRecipe)

app.post("/add-ingredients", recipeController.addIngredients)

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
