require("dotenv").config();

const path = require("path");
const fsExtra = require("fs-extra");
const { v4: uuidv4 } = require('uuid');
const {uploadFile,deleteFile} = require("../util/functions/aws-s3")

const statusCodes = require('../util/status-codes');
const response = require('../models/api/response.model');
const {writeLog} = require('../util/functions/write-log');
let tempPath = path.join(__dirname,"../","../","tmp");

//db
const {db,sequelize} = require("../models/db");
const Image = db.images;
const Service =  db.services;

exports.addService = async (req,res)=>{

    try{
       
        if(!req.files || !req.files.image) return res.status(statusCodes.NOT_ACCEPTABLE)
                                                   .json(response("failed","image required")); 

        let imageUploadResult = await uploadImage(req.files.image);
        
        if(imageUploadResult.status == "error"){
            return res.status(statusCodes.NOT_ACCEPTABLE)
                      .json(response("failed",imageUploadResult.message))
        }
        
        //aws upload
        await uploadFile(imageUploadResult.message.image);
        fsExtra.emptyDirSync(tempPath);
        // save  image data
        let imageResult = await Image.create({
            image:imageUploadResult.message.image,
            file_type:imageUploadResult.message.type,
            size:imageUploadResult.message.size,
            image_type:"SERVICE" });

      

        await Service.create({
            short_title:req.body.shortTitle,
            title:req.body.title,
            description:req.body.description,
            image_id:imageResult.image_id});

        res.status(statusCodes.OK)
           .json(response("success","new service added"));

       
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}


exports.getServices = async (req,res)=>{

    try{
       
        let [services,metadata] =  await sequelize.query(`SELECT  services.service_id,services.title,
                                                    services.short_title,services.description,
                                                    services.createdAt,images.image
                                                    FROM services
                                                    LEFT JOIN images 
                                                        ON images.image_id = services.image_id`);

        res.status(statusCodes.OK)
           .json(response("success","services",{services}));

       
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}

exports.getService = async (req,res)=>{
    let serviceId = req.params.serviceId;
    try{
       
        let [services,metadata] =  await sequelize.query(`SELECT  services.service_id,services.title,
                                                        services.short_title,services.description,
                                                        services.createdAt,images.image
                                                        FROM services
                                                        LEFT JOIN images 
                                                            ON images.image_id = services.image_id
                                                        WHERE services.service_id = ${serviceId}`);

        res.status(statusCodes.OK)
           .json(response("success","services",{services}));

       
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}

exports.deleteService = async (req,res)=>{
    let serviceId = req.params.serviceId;
    try{
       
        let [serviceImage,meta] = await sequelize.query(`SELECT images.image_id,images.image                                                  
                                                        FROM images
                                                        LEFT JOIN services                                                        
                                                            ON images.image_id = services.image_id
                                                        WHERE services.service_id = ${serviceId}`);
        //aws delete
        await deleteFile(serviceImage[0].image);

        await Image.destroy({where:{image_id:serviceImage[0].image_id}});
        await Service.destroy({where:{service_id:serviceId}});

        res.status(statusCodes.OK)
           .json(response("success","deleted successfully"));

       
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}

exports.editService = async (req,res)=>{
    let serviceId = req.params.serviceId;
    try{
       
       //get service and image
       let serviceDb = await Service.findOne({where:{service_id:serviceId}});
       let imageDb = await Image.findOne({where:{image_id:serviceDb.image_id}});
       
       let image = imageDb.image;

       if(req.files && req.files.image){
          //update image 
          //remove old image
         await deleteFile(image);

          //new image upload
          let imageUploadResult = await uploadImage(req.files.image);
          if(imageUploadResult.status == "error"){
                return res.status(statusCodes.NOT_ACCEPTABLE)
                          .json(response("failed",imageUploadResult.message))
           }
          //update db
          image = imageUploadResult.message.image;
          await uploadFile(image);
          fsExtra.emptyDirSync(tempPath);
          await Image.update({
            image,
            file_type:imageUploadResult.message.type,
            size:imageUploadResult.message.size},
            {where:{image_id:serviceDb.image_id}});

        }

        //update services

        await Service.update({
                    short_title:req.body.shortTitle,
                    title:req.body.title,
                    description:req.body.description},
                    {where:{service_id:serviceId}})

        res.status(statusCodes.OK)
           .json(response("success","edited successfully"));

       
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
    

    if(dimensions.width !== 310 || dimensions.height !== 310){ //image size 310 * 310
        fsExtra.unlink(path.join(__dirname,"../../",'tmp',fileName));

        return {status:"error",message:"image size must be 310 * 310 px"};

    }

    return {status:"success",message:{image:fileName,type:file.mimetype,size:file.size}};
}

