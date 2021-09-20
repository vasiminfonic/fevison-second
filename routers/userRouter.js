const express = require('express');
const  router = express.Router();
const { UserModal, CategoryModal, PostModal } = require('../schema/Schema')
require('dotenv').config();
const mongoose = require('mongoose');
const multer  = require('multer')
let path = require('path');
const config = process.env;
const auth = require("../middleware/auth");
var jwt = require('jsonwebtoken');

router.get('/',async(req,res)=>{
    res.status(200).json({
        message: "this is the message from user"
    })
})
router.post('/signup',async(req,res)=>{
    await new UserModal({
        _id: new mongoose.Types.ObjectId,
    })
    res.status(200).json({
        message: "this is from the signup side"
    })
})
// router.post('/login',async(req,res)=>{
//     res.status(200).json({
//         message: "this is from the login side"
//     })
// })
router.post("/register", async (req, res) => {

    // Our register logic starts here
    try {
      // Get user input
      const { name, email, password } = req.body;
  
      // Validate user input
      if (!(email && password && name)) {
        res.status(400).json({error:"All input is required"});
      }
  
      // check if user already exist
      // Validate if user exist in our database
      const oldUser = await UserModal.findOne({email});
  
      if (oldUser) {
        return res.status(409).json({error:"User Already Exist. Please Login"});
      }
      
  
      //Encrypt user password
    //   encryptedPassword = await bcrypt.hash(password, 10);
  
      // Create user in our database
      const user = await UserModal.create({
        _id: new mongoose.Types.ObjectId,
        name: name,
        email: email.toLowerCase(), // sanitize: convert email to lowercase
        password: password,
      });
  
      // Create token
    //   const token = jwt.sign(
    //     { user_id: user._id, email },
    //     process.env.TOKEN_KEY,
    //     {
    //       expiresIn: "2h",
    //     }
    //   );
      // save user token
    //   user.token = token;
  
      // return new user
      res.status(201).json(user);
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  });

  router.post("/login", async (req, res) => {
      console.log(req.body)

    // Our login logic starts here
    try {
      // Get user input
      const { email, password } = req.body;
  
      // Validate user input
      if (!(email && password)) {
        res.status(400).json({error:"All input is required"});
      }
      // Validate if user exist in our database
      const user = await UserModal.findOne({ email });
  
      if (user && password) {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, email },
          process.env.TOKEN_KEY,
          {
            expiresIn: '2h' 
          }
        );
  
        // save user token
        user.token = token;
  
        // user
        res.status(200).json(user);
      }
      res.status(400).json({error:"Invalid Credentials"});
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  });
  router.get("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
  });

  router.get('/dasboard', async (req, res) => {
    try{
      const users = await UserModal.countDocuments();
      const categories = await CategoryModal.countDocuments();
      const posts = await PostModal.countDocuments();
      res.status(200).json({users,categories,posts});
    }catch(err){
      return (console.log(error));
    }
  });
  router.get('/find',async (req,res)=>{
    console.log(req);
    let authHeader = req.headers.authorization;
    if(!authHeader){
      return res.status(403).json("header is Required");
    }
    const token = authHeader.split(' ')[1];
    const { user_id } = jwt.verify(token,process.env.TOKEN_KEY)
    try{
    const user = await UserModal.findOne({_id: user_id }).select('-__v -password -status');
    if(!user){
      return console.log('user is empty');
    }
    res.status(200).json(user);
    }catch(err){
      console.log(err);
    }

  })


module.exports = router;