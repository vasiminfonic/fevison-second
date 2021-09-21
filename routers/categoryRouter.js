const express = require('express');
const  router = express.Router();
const { CategoryModal } = require('../schema/Schema')
require('dotenv').config();
const mongoose = require('mongoose');
const multer  = require('multer')
const { json } = require('express');

router.get('/', async(req, res)=>{ 
    try{
     const findCat = await CategoryModal.find().select("_id categoryTitle description")
     res.status(200).json(findCat);
     
    }catch(err){
        res.status(200).json({message: 'something went wrong +'+ err})
    }
});
router.post('/add', async(req, res)=>{
    console.log(req.body);
    try{
     const newCat = new CategoryModal({
        _id: new mongoose.Types.ObjectId,
        categoryTitle: req.body.title,
        description: req.body.description
     })
      newCat.save()
      .then(res.status(200).json({message: 'One Category Inserted Successfully'}))
     
    }catch(err){
        res.status(200).json({message: 'something went wrong +'+ err})
    }

})
router.delete('/del', async(req, res)=>{
    const ids = req.body.userId;
   let count;
   if(ids){
      count = ids.length; 
   }
   try{
   await CategoryModal.deleteMany({ _id: { $in: ids }})
   .then(res.status(200).json({message:`${count} Category Has Been Deleted`}))
   }catch(err){
      res.status(400).json({message: "Got an error" + err })
   }
});

router.put('/upd', async(req, res)=>{
    console.log(req.body)
    
    try{
        await CategoryModal.updateOne({ _id: req.body.userId }, { $set: { 
            categoryTitle: req.body.title,
            description: req.body.description,
        }})
      res.status(200).json({message: 'One Category Has Been Update'})     
    }catch(err){
        res.status(200).json({message: 'something went wrong +'+ err})
    }
})
router.get('/find/:id', async(req, res)=>{ 
    console.log('reached')
    
    try{
     const _id = req.params.id
     const findCat = await CategoryModal.findOne({ _id }).select("_id categoryTitle description")
     res.status(200).json(findCat)
     
    }catch(err){
        res.status(200).json({message: 'something went wrong +'+ err})
    }
})
router.get('/filter', async(req, res)=>{ 
    let { page, row } = req.query;
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
        await CategoryModal.countDocuments()
        .then(res=>total = res)
        .catch(err=>console.log(err));
     }catch(err){
        console.log(err);
     }
     try{
        await CategoryModal.find().skip(+diff).limit(+row)
        .then(doc=>res.status(200).json({data: doc,total}))
        .catch(err=>console.log(err));
     }catch(err){
        res.status(400).json({message: 'got error' + err})
     }
});


module.exports = router
