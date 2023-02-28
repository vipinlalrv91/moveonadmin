require("dotenv").config();

const path = require("path");
const fsExtra = require("fs-extra");
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const statusCodes = require('../util/status-codes');
const response = require('../models/api/response.model');
const {writeLog} = require('../util/functions/write-log');
const {uploadFile,deleteFile} = require("../util/functions/aws-s3");
//db
const {db,sequelize} = require("../models/db");
const Image = db.images;

let tempPath = path.join(__dirname,"../","../","tmp");
const uploadPath = path.join(__dirname,"../../",'public/uploads/');
exports.addSliderImage = async (req,res)=>{

    try{
        
        let uploadType = req._parsedUrl.pathname == "/mobile"?"mobile":"pc";

        if(!req.files || !req.files.image) return res.status(statusCodes.NOT_ACCEPTABLE)
                                                     .json(response("failed","image required"));

        let imageUploadResult = await uploadImage(req.files.image,uploadType);

        if(imageUploadResult.status == "error"){
            return res.status(statusCodes.NOT_ACCEPTABLE)
                      .json(response("failed",imageUploadResult.message))
        }

        if(process.env.S3_BUCKET_NAME == 2){
            await uploadFile(imageUploadResult.message.image);
        }
        fsExtra.emptyDirSync(tempPath);
        await Image.create({
            image:imageUploadResult.message.image,
            file_type:imageUploadResult.message.type,
            size:imageUploadResult.message.size,
            image_type:uploadType=="pc"?"HOME_PAGE_PC":"HOME_PAGE_MOBILE"});

        res.status(statusCodes.OK)
           .json(response("success","new image added"));
       
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}

exports.getSliderImages = async (req,res)=>{

    try{
        let type  = req._parsedUrl.pathname == "/mobile"?"mobile":"pc";
        
        let images;
   
        if(type =="pc"){

            images=  await Image.findAll({where:{image_type:"HOME_PAGE_PC"},
                                          attributes:["image_id","image_type","image","createdAt"]});
        }else{
            images=  await Image.findAll({where:{image_type:"HOME_PAGE_MOBILE"},
                                          attributes:["image_id","image_type","image","createdAt"]});
        }
       
                

        res.status(statusCodes.OK)
           .json(response("success","images",{images:images}));
       
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}

exports.getSliderFrontendImages = async (req,res)=>{

    try{

        let images = {};
        images.pcImages =  await Image.findAll({where:{image_type:"HOME_PAGE_PC"},
                                           attributes:["image_id","image_type","image","createdAt"]});

        images.mobileImages =  await Image.findAll({where:{image_type:"HOME_PAGE_Mobile"},
                                                      attributes:["image_id","image_type","image","createdAt"]});


        res.status(statusCodes.OK)
           .json(response("success","images",{images:images}));

    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);

        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}

exports.deleteSliderImage = async (req,res)=>{
    let image_id = req.params.imageId;
    try{

        let imageDb = await Image.findOne({where:{image_id}});


        //remove local image
       //

        if(process.env.FILE_UPLOAD_TYPE == 2){
            await deleteFile(imageDb.image);
        }else{
            await Image.destroy({where:{image_id}})
            fs.unlinkSync(uploadPath+imageDb.image);
        }
        res.status(statusCodes.OK)
           .json(response("success","image deleted",));

    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);

        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}

async function uploadImage(file,uploadType){
    let id = await uuidv4()
    let fileName = id+path.extname(file.name);

    const savePath = path.join(__dirname,"../../",'tmp',fileName);

    const uploadsPath = path.join(__dirname,"../../",'public/uploads/',fileName);


    if(file.truncated){
        fsExtra.emptyDirSync(path.join(__dirname,"../../","tmp"));
  
        return {status:"error",message:"file size is too big (5 mb is  max size)"};
  
    }
     
    if(file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png'){
        fsExtra.emptyDirSync(path.join(__dirname,"../../","tmp"));
        return {status:"error",message:"only jpegs and png supported"};
    }
    


    await file.mv(savePath);
    // File destination.txt will be created or overwritten by default.
    fs.copyFile(savePath, uploadsPath, (err) => {
        if (err) throw err;
    });
    //fsExtra.emptyDirSync(path.join(__dirname,"../../","tmp"));

    var sizeOf = require('image-size');
    var dimensions = sizeOf(path.join(__dirname,"../../",'tmp',fileName));
    
    if(uploadType == "pc"){
        console.log("herere");
        if(dimensions.width !== 1900 || dimensions.height !== 1280){
      
            fsExtra.unlink(path.join(__dirname,"../../",'tmp',fileName));
    
            return {status:"error",message:"image size must be 1900 px * 1280 px"};
    
        }
    }else{
        if(dimensions.width !== 1080 || dimensions.height !== 1920){ 
      
            fsExtra.unlink(path.join(__dirname,"../../",'tmp',fileName));
    
            return {status:"error",message:"image size must be 1080 px * 1920 px"};
    
        }
    }
    return {status:"success",message:{image:fileName,type:file.mimetype,size:file.size}};
}

