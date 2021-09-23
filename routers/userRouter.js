const express = require('express');
const  router = express.Router();
const { UserModal, CategoryModal, PostModal, ContactModal } = require('../schema/Schema')
require('dotenv').config();
const mongoose = require('mongoose');
const multer  = require('multer')
let path = require('path');
const config = process.env;
const auth = require("../middleware/auth");
var jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

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
  console.log(req.body);

    // Our register logic starts here
    try {
      // Get user input
      const { name, email, password } = req.body;
      const newEmail = email.toLowerCase();
  
      // Validate user input
      if (!(email && password && name)) {
        res.status(400).json({error:"All input is required"});
      }
  
      // check if user already exist
      // Validate if user exist in our database
      const oldUser = await UserModal.findOne({email:newEmail});
  
      if (oldUser) {
        return res.status(409).json({error:"User Already Exist. Please Login"});
      }
      
  
      //Encrypt user password
    //   encryptedPassword = await bcrypt.hash(password, 10);
  
      // Create user in our database
      const user = await UserModal.create({
        _id: new mongoose.Types.ObjectId,
        name: name,
        email: newEmail, // sanitize: convert email to lowercase
        password: password,
      });
  
      // Create token
      // const token = jwt.sign(
      //   { _id: user._id, email: user.email },
      //   process.env.TOKEN_KEY,
      //   {
      //     expiresIn: "2h",
      //   }
      // );
      // save user token
      // user.token = token;
  
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
      const categories = await CategoryModal.countDocuments({status: 'active'});
      const contact = await ContactModal.countDocuments({status: 'active'});
      const posts = await PostModal.countDocuments({status: 'active'});
      res.status(200).json({users,categories,posts,contact});
    }catch(err){
      return (console.log(error));
    }
  });
  router.get('/find',async (req,res)=>{
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
  router.post('/chpass', async (req,res) => {
    const { current_password, password } = req.body 
    let authHeader = req.headers.authorization;
    if(!authHeader){
      return res.status(403).json({message:"An Authorize", err:true});
    }
    const token = authHeader.split(' ')[1];
    const { user_id } = jwt.verify(token,process.env.TOKEN_KEY)
    try{
      const user = await UserModal.findOne({$and: [{_id: user_id },{password: current_password}]})
      if(!user){
        return res.status(403).json({message:"Current Password Is Wrong", err:true});
      }
      await UserModal.updateOne({_id: user._id},{$set:{password}})
      res.status(200).json({message: "Your Password has been changed", err:false});
      }catch(err){
        console.log(err);
      }
  });

  router.post('/mail', async (req,res)=>{
    async function main() {
      // Generate test SMTP service account from ethereal.email
      // Only needed if you don't have a real mail account for testing
      let testAccount = await nodemailer.createTestAccount();
    
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'vasim.infonic@gmail.com', // generated ethereal user
          pass: 'kavip@123', // generated ethereal password
        },
      });
    
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: "vasim.infonic@gmail.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
      });
    
      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    
      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }
    
    main().catch(console.error);
  })
router.get('/forgot', async(req,res)=>{
  let authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(403).json({message:"An Authorize", err:true});
  }
  try{
  const token = authHeader.split(' ')[1];
  const { user_id } = jwt.verify(token,process.env.TOKEN_KEY);
    res.status(200).json({message: "success",token:user_id, err:false});
  }catch(err){
    res.status(400).json({message: 'An Authorize',err: true}) 
  }

});
router.put('/forgot', async(req,res)=>{
  const { password, user_id } = req.body;
  try{
    await UserModal.updateOne({_id: user_id },{$set:{password}});
    res.status(200).json({message: "Your Password Has been Changed", err:false});
  }catch(err){
    res.status(400).json({message: 'An Authorize',err: true}) 
  }

});
router.post('/forgot', async(req,res)=>{
  const { email } = req.body;
  console.log(req.body);
  const user = await UserModal.findOne({email});
  try{
  if(!user){
    res.status(404).json({message: 'Please enter a velid email'});
  }
  const token = jwt.sign(
    { user_id: user._id },
    process.env.TOKEN_KEY,
    {
      expiresIn: '5m' 
    }
  );
  user.token = token;

  try{

    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'vasim.infonic@gmail.com', // generated ethereal user
        pass: 'kavip@123', // generated ethereal password
      },
    });
    let info = await transporter.sendMail({
      from: '"Infonic Solutions" <infonicsolutions@email.com>', // sender address
      to: user.email, // list of receivers
      subject: "Forget password", // Subject line
      text: "This is confidencial", // plain text body
      html: `<a href='${process.env.HOST}/forgotpass/${token}'>Click Here For Change Password</a>`, // html body
    });

    console.log("Message sent: %s", info.messageId);
    res.status(200).json({message: 'Please Check Your Email for Update Password', err: false});

  }catch(err){
    res.status(500).json({message: 'Server Error', err: true})

  }
  }catch(err){
    res.status(503).json({message: 'Server Error'});
  }
  


})

module.exports = router;