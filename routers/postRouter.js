const express = require('express');
const  router = express.Router();
const { PostModal, CategoryModal } = require('../schema/Schema')
require('dotenv').config();
const mongoose = require('mongoose');
const slugify = require('slugify')
const multer  = require('multer')
const { json, query } = require('express');
let path = require('path');


const storage = multer.diskStorage({
   destination: function(req, file, cb) {
       cb(null, 'images/post');
   },
   filename: function(req, file, cb) {   
      const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9)
       cb(null,file.fieldname + '_' + uniqueSuffix +'_' + path.extname(file.originalname));
   }
 });
let upload = multer({ storage:storage });



router.get('/', async (req,res)=>{
   try {
      const getPost = await PostModal.find({status: 'active'})
      res.status(200).json(getPost)
   }catch(e){
      res.status(404)
		res.send({ error: "Post doesn't exist!" + e})
   }
})
router.post('/del',async(req, res)=>{
   console.log(req.body)
    try{
   await PostModal.deleteOne({ _id: req.body.userId })
   .then(res.status(200).json({message:'One File Has Been Deleted'}))
   }catch(err){
      res.status(400).json({message: err })
   }
   
})
router.post('/add',upload.array('image',10),async(req,res)=>{
   const { title, paragraph, category, seo_title, seo_description, seo_keyword } = req.body;
   console.log(title, paragraph)
  
   const images = [];
   req.files.forEach(ele => {
      images.push(ele.filename);
    });
      const newPost = new PostModal({
      _id: new mongoose.Types.ObjectId,
      title: title,
      slug: slugify(`${title}`,{ lower: true, remove: /[*+~.()'"!:@]/g }),
      paragraph: paragraph,
      category: category,
      seo_title: seo_title,
      seo_keyword: seo_keyword,
      seo_description: seo_description,
      image: images
      })
   await newPost.save()
   .then(doc => res.status(200).json({doc: doc,message: 'Data Inserted Successfully'}))
   .catch((err)=>res.status(404).json(err))
});


router.put('/update',upload.array('image',10), async(req,res)=>{
   console.log(req.files)
   
   const images = [];
   req.files.forEach(ele => {
      images.push(ele.filename);
    });
    console.log(req.body)
   try { 

      await PostModal.updateOne({ _id: req.body.userId }, { $set: { 
      title: req.body.title,
      slug:req.body.slug,
      paragraph: req.body.paragraph,
      category: req.body.category,
      image: images,
      seo_title: req.body.seo_title,
      seo_keyword: req.body.seo_keyword,
      seo_description: req.body.seo_description,
      
   }})
   .then(res.status(200).json({message: "Post Updated Succesfully"}))
   .catch((err)=>console.log(err))

   }catch(err){
      res.status(400).json("got an error" + err)
   }  
})


router.put('/tra',async(req, res)=>{
   console.log(req.body)

    try{
    await PostModal.updateOne({ _id: req.body.userId }, { $set: { status: req.body.status }})
   .then(res.status(200).json({message:'One File Has Been Trashed'}))
   }catch(err){
      res.status(400).json({message:'got an'+ err })
   }
   
})
router.get('/gettra' ,async(req,res)=>{
   console.log(req.body)
   try{
      await PostModal.find({status: 'deActive'})
      .then(doc=>res.status(200).json(doc))
   }catch(err){
      res.status(400).json({message: 'got error' + err})
   }
})


router.get('/filter', async (req,res)=>{
   const { page, row, catId } = req.query;
  
   let  num = parseInt(page) || 0;
   if(num <= 0) {
      num = 0
   }
   console.log(num)
   let limit = parseInt(row) || 10
   let diff = limit * (num);
   let total = 0;
   try {
      let findValue;
      if(catId !== 'null'){
         findValue = {$and: [{status: 'active'}, {category: { $in: catId }}]}
      }else{
         findValue = {status: 'active'}
      }
      await PostModal.countDocuments(findValue, (err,result)=>{
         if(err){
            console.log(err)
            res.json({err})
         }else{
            total = result
         }
      })

      const getPost = await PostModal.find(findValue).skip(diff).limit(limit)
      res.status(200).json({getPost,total})
      // console.log(countDoc)
      console.log(req.query,total)
   }catch(e){
      res.status(404)
		res.send({ error: "Post doesn't exist!" + e})
   }  
})

router.get('/filter/category', async (req,res)=>{
   let  num = parseInt(req.query.page) || 0;
   if(num <= 0){
      num = 0
   }
   let category = req.query.category
   console.log(category)
   let catCheck ={
      status:'active'
   }
   if(category !==''){
      catCheck={
         status: 'active',
         category: category
     }
     console.log('this is not empty')
   }
   
   console.log(catCheck)
   let limit = parseInt(req.query.row) || 10
   let diff = limit * (num);
   let total = 0;
   try {
      PostModal.countDocuments(catCheck, (err,result)=>{
         if(err){
            console.log(err)
            res.json({err})
         }else{
            total = result
         }
      })
      const getPost = await PostModal.find(catCheck).skip(diff).limit(limit)
      res.status(200).json({getPost,total})
      // console.log(countDoc)
   }catch(e){
      res.status(404)
		res.send({ error: "Post doesn't exist!" + e})
   }
   // res.json({message: "requested for get"})
  
})
router.post('/delall',async (req, res)=>{
   console.log(req.body)
   const ids = req.body.id
   let count = ids.length 
    try{
   await PostModal.deleteMany({ _id: { $in: ids}})
   .then(res.status(200).json({message:`Your ${count} File Has Been Deleted`}))
   }catch(err){
      res.status(400).json({message: err })
   }
   
})
router.get('/find/:id', async (req,res)=>{
   const _id = req.params.id 
   console.log(req.params)
   try {
      const getPost = await PostModal.findOne({ $and: [{status: 'active'},{_id}] }).select('-__v')
      res.status(200).json(getPost)
   }catch(e){
      res.status(404)
		res.send({ error: "Post doesn't exist!" + e})
   }
   res.json({message: "requested for get"})
  
})


router.get('/find_slug/:filter', async (req,res)=>{
   const slug = req.params.filter 
   console.log(req.params)
   try {
      const getPost = await PostModal.findOne({ $and: [{status: 'active'},{ slug }] }).select('-__v')
      res.status(200).json(getPost)
   }catch(e){
      res.status(404)
		res.send({ error: "Post doesn't exist!" + e})
   }
   res.json({message: "requested for get"})
  
})


module.exports = router;