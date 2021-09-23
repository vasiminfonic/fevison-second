const express = require('express');
const  router = express.Router();
const { ContactModal } = require('../schema/Schema')
require('dotenv').config();
const mongoose = require('mongoose');
const multer  = require('multer');
const { json } = require('express');

router.get('/', async(req, res)=>{ 
    try{
     const findCont = await ContactModal.find().sort({_id: -1}).select(" -__v");
     res.status(200).json(findCont);
     
    }catch(err){
        res.status(200).json({message: 'something went wrong +'+ err})
    }

})
router.post('/add', async(req, res)=>{
    console.log(req.body)
    const { name, email, subject, message } = req.body;
    try{
        const data = new ContactModal({
            name: name,
            email: email,
            subject: subject,
            message: message
        })
        await data.save()
        .then(res.status(200).json({message: 'your request has been submitted' }));
     
    }catch(err){
        res.status(200).json({message: 'something went wrong +'+ err})
    }

});

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
        await ContactModal.countDocuments({status: 'active'})
        .then(res=>total = res)
        .catch(err=>console.log(err));
     }catch(err){
        console.log(err);
     }
     try{
        await ContactModal.find({status: 'active'}).sort({_id: -1}).skip(+diff).limit(+row)
        .then(doc=>res.status(200).json({data: doc,total}))
        .catch(err=>console.log(err));
     }catch(err){
        res.status(400).json({message: 'got error' + err})
     }
});

router.delete('/delete',async (req, res)=>{
    console.log(req.body)
    const ids = req.body.id;
    let count;
    if(ids){
       count = ids.length; 
    }
    try{
    await ContactModal.deleteMany({ _id: { $in: ids}})
    .then(res.status(200).json({message:`Your ${count} File Has Been Deleted`}));
    }catch(err){
       res.status(400).json({message: err })
    }
    
 })
 router.get('/find/:id', async(req, res)=>{ 
     console.log(req.params.id)
    try{
     const _id = req.params.id
     const findCon = await ContactModal.findOne({ _id });
     res.status(200).json(findCon);
    }catch(err){
        res.status(400).json({message: 'something went wrong +'+ err})
    }
})
router.put('/upd', async(req, res)=>{
    console.log(req.body)
    
    try{
        await ContactModal.updateOne({ _id: req.body.userId }, { $set: { 
            name: req.body.name,
            email: req.body.email,
            message: req.body.message,
            subject: req.body.subject
        }});
      res.status(200).json({message: 'One Contact Has Been Update'})     
    }catch(err){
        res.status(400).json({message: 'something went wrong +'+ err})
    }
});
router.put('/trash',async(req, res)=>{
    const { userId, status } = req.body;
    let count;
    if (userId){
       count = userId.length;
    }
    console.log(userId, status);
     try{
     await ContactModal.updateMany({ _id: {$in :userId }}, { $set: { status }})
    .then(res.status(200).json({message:`${count} File has been ${ status === 'active' ? 'restore' : 'trashed' } `}))
    .catch((err)=>res.status(400).json({message: err}));
    }catch(err){
       res.status(500).json({message:'got an'+ err });
    }
 });
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
       await ContactModal.countDocuments({status: 'deActive'})
       .then(res=>total = res)
       .catch(err=>console.log(err));
    }catch(err){
       console.log(err);
    }
    try{
       await ContactModal.find({status: 'deActive'}).skip(+diff).limit(+row)
       .then(doc=>res.status(200).json({data: doc,total}))
       .catch(err=>res.status(400).json({message: err}));
    }catch(err){
       res.status(400).json({message: 'got error' + err})
    }
 });

 

module.exports = router
