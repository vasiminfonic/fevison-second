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
      const getPost = await PostModal.find({status: 'active'}).select('-status -__v').sort({ _id: -1 });
      res.status(200).json(getPost);
   }catch(e){
      res.status(404)
		res.send({ error: "Post doesn't exist!" + e})
   }
   // res.json({message: "requested for get"})
  
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
   .catch((err)=>res.status(404).json({message: err}));
});


router.put('/update',upload.array('image',10), async(req,res)=>{
   console.log(req.files)
   let { title, paragraph, category, seo_title, seo_keyword, seo_description, slug, userId } = req.body;
   
   const images = [];
   req.files.forEach(ele => {
      images.push(ele.filename);
    });
    
    console.log(req.body.category);
   try { 
      await PostModal.updateOne({ _id: userId }, { $set: { 
      title: title,
      paragraph: paragraph,
      category: category,
      image: images,
      slug: slugify(`${slug}`,{ lower: true, remove: /[*+~.()'"!:@]/g }),
      seo_title: seo_title,
      seo_keyword: seo_keyword,
      seo_description: seo_description,
   }})
   .then(res.status(200).json({message: "Post Updated Succesfully"}))
   .catch((err)=>(res.json({message: err })))

   }catch(err){
      res.status(400).json({message: err})
   }  
})


router.put('/trash',async(req, res)=>{
   const { userId, status } = req.body;
   let count;
   if (userId){
      count = userId.length;
   }
   console.log(userId, status);
    try{
    await PostModal.updateMany({ _id: {$in :userId }}, { $set: { status }})
   .then(res.status(200).json({message:`${count} File has been ${ status === 'active' ? 'restore' : 'trashed' } `}))
   .catch((err)=>res.status(400).json({message: err}));
   }catch(err){
      res.status(500).json({message:'got an'+ err });
   }
})
router.get('/trash/filter' ,async(req,res)=>{
   let { page, row } = req.query
   if(page <= 0){
      page = 0;
   }
   if(row <= 5){
      row = 5;
   }
   let diff = row * page;
   console.log(page, row);
   let total;
   try{
      await PostModal.countDocuments({status: 'deActive'})
      .then(res=>total = res)
      .catch(err=>console.log(err));
   }catch(err){
      console.log(err);
   }
   try{
      await PostModal.find({status: 'deActive'}).skip(+diff).limit(+row)
      .then(doc=>res.status(200).json({data: doc,total}))
      .catch(err=>res.status(400).json({message: err}));
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

      const getPost = await PostModal.find(findValue,'-status -__v').skip(+diff).limit(+limit).sort({ _id: -1 });
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
   const ids = req.body.id;
   let count;
   if(ids){
      count = ids.length; 
   }
   try{
   await PostModal.deleteMany({ _id: { $in: ids}})
   .then(res.status(200).json({message:`Your ${count} File Has Been Deleted`}))
   }catch(err){
      res.status(400).json({message: err });
   }
   
})
router.get('/find/:id', async (req,res)=>{
   const _id = req.params.id 
   console.log(req.params)
   try {
      const getPost = await PostModal.findOne({ $and: [{status: 'active'},{_id}] }).select('-status -__v')
      res.status(200).json(getPost)
   }catch(e){
      res.status(404)
		res.send({ error: "Post doesn't exist!" + e})
   }
  
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