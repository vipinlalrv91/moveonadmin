require("dotenv").config();
const statusCodes = require('../util/status-codes');
const response = require('../models/api/response.model');
const {writeLog} = require('../util/functions/write-log');
const path = require("path");
const fs = require("fs");
const fsExtra =require("fs-extra");
const { v4: uuidv4 } = require('uuid');
const {uploadFile,deleteFile} = require("../util/functions/aws-s3");
//db
const {db,sequelize} = require("../models/db");
const AboutMe = db.aboutMe;
const Image = db.images;
let tempPath = path.join(__dirname, "../", "../", "tmp");

exports.updateAboutMe = async (req,res)=>{
    
    try{
      
        if(!req.files || !req.files.image){
            return res.status(statusCodes.NOT_ACCEPTABLE)
                      .json(response("failed","image required"));
            
        }

        
        
        let imageRes = await uploadImage(req.files.image);
        if(imageRes.status == "error"){
            return res.status(statusCodes.NOT_ACCEPTABLE)
                      .json(response("failed",imageRes.message))
        }
       
        let image = imageRes.message.image;
          
        let shortTitle = req.body.shortTitle;
        let title = req.body.title;
        let description = req.body.description;

        //create a record if there is none
        let record = await AboutMe.findAll({});
        
        if(record.length == 0){
            // create new record
            //aws upload
            await uploadFile(image);
            fsExtra.emptyDirSync(tempPath);

            
            let imageDb = await Image.create({
                            image:imageRes.message.image,
                            file_type:imageRes.message.type,
                            size:imageRes.message.size,
                            image_type:"ABOUT_ME"});

            await AboutMe.create({
                short_title:shortTitle,
                title:title,
                description:description,
                image_id:imageDb.image_id});
        }else{
            let imageId = record[0].image_id;
            let imageData = await Image.findOne({where:{image_id:imageId}});
           
            //remove old image 
            await deleteFile(imageData.image);

            //upload new image
            //aws upload
            await uploadFile(image);
            fsExtra.emptyDirSync(tempPath);
            
            //update existing one 
            await Image.update({image:imageRes.message.image,
                                file_type:imageRes.message.type,
                                size:imageRes.message.size},
                                {where:{image_id:imageId}});

            await AboutMe.update({short_title:shortTitle,
                                  title:title,
                                  description:description},
                                 {where:{about_me_id:1}});
        }


        res.json(response("success","about me updated"));
       
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}

exports.updateSignatureImage = async (req,res)=>{
    
    try{
      
        if(!req.files || !req.files.image){
            return res.status(statusCodes.NOT_ACCEPTABLE)
                      .json(response("failed","image required"));
            
        }


        
        let imageRes = await uploadSignatureImage(req.files.image);
        if(imageRes.status == "error"){
            return res.status(statusCodes.NOT_ACCEPTABLE)
                      .json(response("failed",imageRes.message))
        }
        
        
        
        let signatureImageDb = await Image.findOne({where:{image_type:"SIGNATURE_IMAGE"}});
    
        if(!signatureImageDb){
            //add new entry 
            let imageDb = await Image.create({
                image:imageRes.message.image,
                file_type:imageRes.message.type,
                size:imageRes.message.size,
                image_type:"SIGNATURE_IMAGE"});
            
            //aws upload
            let img = imageRes.message.image;
            await uploadFile(img);
            fsExtra.emptyDirSync(tempPath);

            await AboutMe.update({signature_image_id:imageDb.image_id},
                                 {where:{about_me_id:1}});
        }else{
            //update exiting entry 
             //remove old image 
             await deleteFile(signatureImageDb.image);
              
             //add new image to aws
             let img = imageRes.message.image;
             await uploadFile(img);
             fsExtra.emptyDirSync(tempPath);
             await Image.update({image:imageRes.message.image,
                                file_type:imageRes.message.type,
                                size:imageRes.message.size},
                                {where:{image_id:signatureImageDb.image_id}});
        }
        

        res.json(response("success","signature image added"));
       
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}


exports.fetchAboutMe = async (req,res)=>{

    try{
       
       let [aboutMe,meta] = await sequelize.query(`SELECT short_title,title,description,
                                                im1.image AS image,
                                                im2.image AS signatureImage 
                                                FROM about_me
                                            LEFT JOIN images AS im1
                                            ON im1.image_id = about_me.image_id
                                            LEFT JOIN images AS im2
                                            ON im2.image_id = about_me.signature_image_id
                                            WHERE about_me.about_me_id = 1`)

        res.json(response("success","about me",{aboutMe}))
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}


async function uploadImage(file){
    let id = await uuidv4()
    let fileName = id+path.extname(file.name);
    const savePath = path.join(__dirname,"../../",'tmp',fileName);
    
    if(file.truncated){
        fsExtra.emptyDirSync(path.join(__dirname,"../../","tmp"));
  
        return {status:"error",message:"file size is too big (5 mb is  max size)"};
  
    }
     
    if(file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png'){
        fsExtra.emptyDirSync(path.join(__dirname,"../../","tmp"));
        return {status:"error",message:"only jpegs and png supported"};
    }
    


    await file.mv(savePath);


    var sizeOf = require('image-size');
    var dimensions = sizeOf(path.join(__dirname,"../../",'tmp',fileName));
    

    if(dimensions.width !== 1240 || dimensions.height !== 1500){ //image size 310 * 310
      
        fsExtra.unlink(path.join(__dirname,"../../",'tmp',fileName));

        return {status:"error",message:"image size must be 1240 * 1500 px"};

    }

    return {status:"success",message:{image:fileName,type:file.mimetype,size:file.size}};
}

async function uploadSignatureImage(file){
    let id = await uuidv4()
    let fileName = id+path.extname(file.name);
    const savePath = path.join(__dirname,"../../",'tmp',fileName);

    if(file.truncated){
        fsExtra.emptyDirSync(path.join(__dirname,"../../","tmp"));
  
        return {status:"error",message:"file size is too big (5 mb is  max size)"};
  
    }
     
    if(file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png'){
        fsExtra.emptyDirSync(path.join(__dirname,"../../","tmp"));
        return {status:"error",message:"only jpegs and png supported"};
    }
    


    await file.mv(savePath);
    

    var sizeOf = require('image-size');
    var dimensions = sizeOf(path.join(__dirname,"../../",'tmp',fileName));
    

    if(dimensions.width !== 400 || dimensions.height !== 232){ //image size 310 * 310
      
        fsExtra.unlink(path.join(__dirname,"../../",'tmp',fileName));

        return {status:"error",message:"image size must be 400 * 232 px"};

    }

    return {status:"success",message:{image:fileName,type:file.mimetype,size:file.size}};
}






