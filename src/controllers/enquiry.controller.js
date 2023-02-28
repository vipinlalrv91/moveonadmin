require("dotenv").config();
const statusCodes = require('../util/status-codes');
const response = require('../models/api/response.model');
const {writeLog} = require('../util/functions/write-log');
const path = require("path");
const fs = require("fs");
const fsExtra =require("fs-extra");
const { v4: uuidv4 } = require('uuid');
const {uploadBatchFiles,deleteFile} = require("../util/functions/aws-s3")
//db
const {db,sequelize} = require("../models/db");
const Enquiry = db.enquiries;
const EnquiryImage = db.enquiryImages;
const ThemeImage = db.conceptImages
const Image = db.images;
let tempPath = path.join(__dirname,"../","../","tmp");

exports.addEnquiry = async (req,res)=>{
    try{
        

        
        let enquiryResult  = await Enquiry.create({
                                    name:req.body.name,
                                    email:req.body.email,
                                    gender:req.body.gender,
                                    phone:req.body.phone,
                                    nationality:req.body.nationality,
                                    address:req.body.location,
                                    age:parseInt(req.body.age),
                                    under_18_with_parents:req.body.under18,
                                    socailmedia:req.body.socialmedia,
                                    height:parseInt(req.body.height),
                                    hair_color:req.body.haircolor,
                                    weight:parseInt(req.body.bodyweight),
                                    waist:parseInt(req.body.waist),
                                    hip:parseInt(req.body.hip),
                                    chest_or_bust:parseInt(req.body.chestbust),
                                    theme:req.body.theme,
                                    theme_link:req.body.themelink});


        let enquiryImages = [];
        let themeImages = [];

        enquiryImages = req.files.enquiryImages;
        enquiryImages = ( enquiryImages == undefined)? []: enquiryImages;

        themeImages = req.files.themeImages;
        themeImages = ( themeImages == undefined)? []: themeImages;

       
        if(!Array.isArray(enquiryImages)){
           enquiryImages = [];
           enquiryImages[0] = req.files.enquiryImages;
        }

        if(!Array.isArray(themeImages)){
            themeImages = [];
            themeImages[0] = req.files.themeImages;
         }
        
        

        let enquiryImagesUploadResult  = await handleFileUpload(enquiryImages,"enquiry");
        let imgRes = null;
        await Promise.all(enquiryImagesUploadResult.message.map(async (image) => {

            //aws upload
            await uploadBatchFiles(image.image);
            
            
            //add to image table
            imgRes = await Image.create({
                                    image:image.image,
                                    file_type:image.type,
                                    size:image.size,
                                    image_type:"ENQUIRY"});
            //add portfolioImages
        await EnquiryImage.create({
            image_id:imgRes.image_id,
            enquiry_id:enquiryResult.enquiry_id});
        }));
        
        
        imgRes = null;
        
  
        let themeImageUploadResult  = await handleFileUpload(themeImages,"theme");
        
        await Promise.all(themeImageUploadResult.message.map(async (image) =>{
                //aws upload
                await uploadBatchFiles(image.image);
               

                //add to image table
                imgRes = await Image.create({
                                        image:image.image,
                                        file_type:image.type,
                                        size:image.size,
                                        image_type:"ENQUIRY_THEME"});
                //add portfolioImages
                await ThemeImage.create({
                            image_id:imgRes.image_id,
                            enquiry_id:enquiryResult.enquiry_id});
        }));

        
         //clear folder
         fsExtra.emptyDirSync(path.join(__dirname,"../../","tmp"));



        res.json(response("success","your enquiry has received successfully,we'll get back to you soon."))
       
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
}


exports.getEnquiries = async (req,res)=>{

    try{
       
        let enquires = await Enquiry.findAll({order:[["createdAt", "DESC"]]});
        
        res.json(response("success","enquires",{enquires}));

       
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}
exports.getEnquiry= async (req,res)=>{

    try{
        let enquiryId = req.params.enquiryId;
        let enquiry = {};
        enquiry.details = await Enquiry.findOne({where:{enquiry_id:enquiryId}});
        
        let [enquiryImages,meta1] = await sequelize.query(`SELECT images.image FROM images
                                                     LEFT JOIN enquiry_images
                                                          ON images.image_id = enquiry_images.image_id
                                                     LEFT JOIN enquiries
                                                          ON enquiry_images.enquiry_id = enquiries.enquiry_id
                                                     WHERE enquiries.enquiry_id = ${enquiryId};`);
        enquiry.enquiryImages = enquiryImages;

        let [themeImages,meta2] = await sequelize.query(`SELECT images.image FROM images
                                                     LEFT JOIN concept_images
                                                        ON concept_images.image_id = images.image_id
                                                     LEFT JOIN enquiries
                                                        ON concept_images.enquiry_id = enquiries.enquiry_id
                                                     WHERE enquiries.enquiry_id = ${enquiryId};`);
        enquiry.themeImages = themeImages;
       
        res.json(response("success","enquiry",{enquiry:enquiry}));
        
       

       
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}

exports.getImages = async (req,res)=>{
    let enquiryId = req.params.enquiryId;

    try{
       
       let enqImages = await EnquiryImage.findAll({where:{enquiry_id:enquiryId}});
       let images = [],image;
       await Promise.all(enqImages.map(async (enquiry) =>{
            image = await Image.findOne({where:{image_id:enquiry.image_id},
                                         attributes:["image_id","image"]});
           images.push(image);
        }));
       
        res.json(response("success","enquiry images",{images}))
       
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}

exports.getThemeImages = async (req,res)=>{
    let enquiryId = req.params.enquiryId;

    try{
       
       let enqImages = await ThemeImage.findAll({where:{enquiry_id:enquiryId}});
       let images = [],image;
       await Promise.all(enqImages.map(async (enquiry) =>{
            image = await Image.findOne({where:{image_id:enquiry.image_id},
                                         attributes:["image_id","image"]});
           images.push(image);
        }));
       
        res.json(response("success","theme images",{themeImages:images}))
       
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}

exports.deleteEnquiry = async (req,res)=>{
    let enquiryId = req.params.enquiryId;

    try{
       
        let DBenquiryImages = await EnquiryImage.findAll({where:{enquiry_id:enquiryId}});
        

        
        let imageRes,images = [];
        await Promise.all(DBenquiryImages.map(async (dbEnqImage)=>{
            
            imageRes = await Image.findOne({where:{image_id:dbEnqImage.image_id},
                                            attributes:["image_id","image"]});
            images.push(imageRes);
        }));
        

        
        //delete enquiry images
        await Promise.all(images.map(async (image)=>{
           let im = image.image;
           //delete locally file
           let result = await deleteFile(im);
           console.log(result);
           //from db
           await Image.destroy({where:{image_id:image.image_id}});
         
        }));
        //delete enqimages from DB
        await EnquiryImage.destroy({where:{enquiry_id:enquiryId}});


        //delete theme images
        images=[],imagRes=null;
        let dbThemeImages = await ThemeImage.findAll({where:{enquiry_id:enquiryId}});
        
        await Promise.all(dbThemeImages.map(async (dbThemeImage)=>{
            imageRes = await Image.findOne({where:{image_id:dbThemeImage.image_id},
                                            attributes:["image_id","image"]});

            images.push(imageRes);
        }));

     
        await Promise.all(images.map(async (image)=>{
            //delete locally file
            let im = image.image;
            let result = await deleteFile(im);
            console.log(result);
            await deleteFile(im);
            //from db
            await Image.destroy({where:{image_id:image.image_id}});
        }));

        
        //delete theme images
        await ThemeImage.destroy({where:{enquiry_id:enquiryId}});

        //delete enquiry
        await Enquiry.destroy({where:{enquiry_id:enquiryId}});
       
        res.json(response("success","enquiry deleted"))
       
    }catch(error){
        
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}

exports.checkSocialLinksExists = async (req,res)=>{

    let socialMediaId = req.params.socialMediaId;    
    try{
       
      let result = await Enquiry.findAll({where:{socailmedia:socialMediaId}});
      console.log(result);

      if(result.length > 0) return res.status(statusCodes.NOT_ACCEPTABLE)
                                      .json(response("failed","Instagram ID Already Exists"));
      res.json(response());
       
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}

exports.checkPhoneExists = async (req,res)=>{

    let phone = req.params.phone;    
    try{
       
      let result = await Enquiry.findAll({where:{phone:phone}});
      

      if(result.length > 0) return res.status(statusCodes.NOT_ACCEPTABLE)
                                      .json(response("failed","Mobile Number Already Exists"));
      res.json(response());
       
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}
exports.checkEmailExists = async (req,res)=>{

    let email = req.params.email;    
    try{
       
      let result = await Enquiry.findAll({where:{email:email}});
      console.log(result);

      if(result.length > 0) return res.status(statusCodes.NOT_ACCEPTABLE)
                                      .json(response("failed","Email ID Already Exists"));
      res.json(response());
       
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}



const handleFileUpload =  async (uploads,type) => {
    let fileName,savePath,images=[];
  try{
    
    await uploads.forEach(async upload => {
        let id = await uuidv4()
        fileName = id+path.extname(upload.name);
   
        savePath = path.join(__dirname,"../../",'tmp',fileName);
        if(type == "enquiry"){
          savePath = path.join(__dirname,"../../",'tmp',fileName);
        }
        
        upload.mv(savePath);
        
        images.push({image:fileName,type:upload.mimetype,size:upload.size})

        console.log({image:fileName,type:upload.mimetype,size:upload.size});
    });
    console.log(images);
    return {status:"success",message:images};
  }catch(error){
    writeLog(__dirname,error.message);
       
    return {status:"error",message:(error.message)}
  }
    
   
    

};

