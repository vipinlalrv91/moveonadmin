require("dotenv").config();
const statusCodes = require('../util/status-codes');
const response = require('../models/api/response.model');
const {writeLog} = require('../util/functions/write-log');
const fsExtra = require("fs-extra");
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const {uploadFile,deleteFile} = require("../util/functions/aws-s3")
const {db,sequelize} = require("../models/db");
const Portfolio = db.portfolios;
const PortfolioImages = db.portfolioImages;
const Image = db.images;
let tempPath = path.join(__dirname,"../","../","tmp");

exports.addPortfolio = async (req,res)=>{
    let title = req.body.title;
    let shortTitle = req.body.shortTitle;
    
    try{
      
        if(!req.files || !req.files.thumbImage) return res.status(statusCodes.NOT_ACCEPTABLE)
                                                   .json(response("failed","thumb image required")); 
        

        let ThumbImageResult = await uploadThumbImage(req.files.thumbImage);
        
        if(ThumbImageResult.status == "error"){
            return res.status(statusCodes.NOT_ACCEPTABLE)
                      .json(response("failed",ThumbImageResult.message));
        }
        
        
        await uploadFile(ThumbImageResult.message.image);
        fsExtra.emptyDirSync(tempPath);
        //save image 
        let imgDBresult = await Image.create({
                                image:ThumbImageResult.message.image,
                                file_type:ThumbImageResult.message.type,
                                size:ThumbImageResult.message.size,
                                image_type:"PORTFOLIO_THUMB"});
        
        let portfolio = await Portfolio.create({
                hex_id:await uuidv4(),
                short_title:shortTitle,
                title:title,
                thumb_image:imgDBresult.image_id});
    


        res.status(statusCodes.OK)
           .json(response("success","new portfolio added",{portfolioId:portfolio.portfolio_id}));
       
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}

exports.addPortfolioImages = async (req,res)=>{
   let portfolioId = req.params.portfolioId;
   
    try{
      
        if(!req.files || !req.files.images) return res.status(statusCodes.NOT_ACCEPTABLE)
                                                   .json(response("failed","images required ")); 
        

        let imageUploadResult = await handleFileUpload(req.files.images);
        
        let images = imageUploadResult.message;
       

        await Promise.all(images.map(async (image) =>{
           
            //add to image table
            await uploadFile(image.image);
            let imageDb = await Image.create({
                                    image:image.image,
                                    file_type:image.type,
                                    size:image.size,
                                    image_type:"PORTFOLIO"});
            //add portfolioImages
            await PortfolioImages.create({
                         image_id:imageDb.image_id,
                         portfolio_id:portfolioId});
        }));
        //clear temp files
        fsExtra.emptyDirSync(path.join(__dirname,"../../","tmp"));   
        
        
        res.status(statusCodes.OK)
           .json(response("success","portfolio added"));
       
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}


exports.getPortfolios = async (req,res)=>{
    

    try{
      
        let [portfolios,meta] = await sequelize.query(`SELECT portfolios.portfolio_id,
                                                              portfolios.hex_id,
                                                              portfolios.short_title,
                                                              portfolios.title,
                                                              thumbImage.image AS thumbImg,
                                                              portfolios.createdAt
                                                       FROM portfolios
                                                       LEFT JOIN images AS thumbImage
                                                       ON thumbImage.image_id = portfolios.thumb_image`);

        let queryImages = (portfolioId)=> `SELECT images.image FROM portfolio_images
                                           JOIN images 
                                                ON images.image_id = portfolio_images.image_id
                                           WHERE portfolio_images.portfolio_id = ${portfolioId}`;
        let [images,meta2] = [];
        await Promise.all(portfolios.map(async (portfolio)=>{
            [images,meta2] = await sequelize.query(queryImages(portfolio.portfolio_id));
            
            portfolio.images = images;
        }));                                                

        res.status(statusCodes.OK)
           .json(response("success","portfolios",{portfolios:portfolios}));
       
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}

exports.getPortfolioImages = async (req,res)=>{
    
    let hexId = req.params.hexId;
    try{
      
        let [images,meta] = await sequelize.query(`SELECT portfolios.portfolio_id,
                                                            portfolios.hex_id,
                                                            images.image  
                                                    FROM images
                                                    LEFT JOIN portfolio_images
                                                        ON images.image_id = portfolio_images.image_id
                                                    LEFT JOIN portfolios
                                                        ON portfolios.portfolio_id = portfolio_images.portfolio_id
                                                    WHERE portfolios.hex_id = '${hexId}'`);
        

         
        res.status(statusCodes.OK)
           .json(response("success","images",{images}));
       
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}

exports.updatePortfolio = async (req,res)=>{
    
    let portfolioId = req.params.portfolioId;
    try{
        
       
        if(req.files && req.files.thumbImage){
            //get details
            let portfolio = await Portfolio.findOne({where:{portfolio_id:portfolioId}});
            let dbThumbnailImage = await Image.findOne({where:{image_id:portfolio.thumb_image}});

            // //delete old image
            await deleteFile(dbThumbnailImage.image);
            

            //upload new image
            let uploadImageResult = await uploadThumbImage(req.files.thumbImage);

            if(uploadImageResult.status == "error"){
                return res.status(statusCodes.NOT_ACCEPTABLE)
                          .json(response("failed",ThumbImageResult.message));     
            }
            
            //upload new image 
            await uploadFile(uploadImageResult.message.image);
            fsExtra.emptyDirSync(tempPath);

            await Image.update({image:uploadImageResult.message.image},
                                            {where:{image_id:portfolio.thumb_image}});
            
            
            res.status(statusCodes.OK)
               .json(response("success","updated title image"));
            
        }
        
        let image = req.body.oldPortfolioImage;
        if(req.files && req.files.portfolioImage && image){
           //get details
           let [dbData,meta] = await sequelize.query(`SELECT images.image_id,
                                                    portfolio_images.portfolio_image_id,
                                                    images.image 
                                                FROM images
                                                LEFT JOIN portfolio_images
                                                    ON portfolio_images.image_id = images.image_id
                                                WHERE portfolio_images.portfolio_id = ${portfolioId}
                                                    AND images.image = '${image}';`);
            dbData = dbData[0];
             //delete old image
            //fsExtra.unlink(path.join(__dirname,"../../",'public', 'resources','images',"portfolio",dbData.image));
            //upload new image
            let uploadImageResult = await uploadSinglePortfolioImage(req.files.portfolioImage);

            if(uploadImageResult.status == "error"){
                return res.status(statusCodes.NOT_ACCEPTABLE)
                          .json(response("failed",ThumbImageResult.message));     
            }
           
             
             //upload new image 
             await uploadFile(uploadImageResult.message.image);
             fsExtra.emptyDirSync(tempPath);
             //update image 
             let result = await Image.update({image:uploadImageResult.message.image},
                                     {where:{image_id:dbData.image_id}});


            res.status(statusCodes.OK)
               .json(response("success","updated portfolio image"));

          
        }
        
        let title = req.body.title;
        if(req.body && title){
            
            await Portfolio.update({title:title},
                                   {where:{portfolio_id:portfolioId}});
            
            res.status(statusCodes.OK)
               .json(response("success","updated portfolio title"));
        }

        let shortTitle = req.body.shortTitle;
        if(req.body && shortTitle){
            
            await Portfolio.update({short_title:shortTitle},
                                   {where:{portfolio_id:portfolioId}});
            
            res.status(statusCodes.OK)
               .json(response("success","updated portfolio short title"));
        }
       
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}


exports.addImageToAlbum = async (req,res)=>{
    
    let portfolioId = req.params.portfolioId;
    try{
        
    
       if(req.files && req.files.image){
            //upload new image
            let uploadImageResult = await uploadSinglePortfolioImage(req.files.image);

            if(uploadImageResult.status == "error"){
                return res.status(statusCodes.NOT_ACCEPTABLE)
                        .json(response("failed",ThumbImageResult.message));     
            }
            
            //new image upload
            await uploadFile(ThumbImageResult.message.image);
            fsExtra.emptyDirSync(tempPath);
            let imageUploadResult = await Image.create({image:uploadImageResult.message.image,
                                                        file_type:uploadImageResult.message.type,
                                                        size:uploadImageResult.message.size,
                                                        image_type:"PORTFOLIO"})

            await PortfolioImages.create({image_id:imageUploadResult.image_id,
                                          portfolio_id:portfolioId});

            res.status(statusCodes.OK)
               .json(response("success","added new image to album"));
            
       }else{
        res.status(statusCodes.NOT_ACCEPTABLE)
           .json(response("error","image required"));
       }
       
    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}

exports.deletePortfolio = async (req,res)=>{
    let portfolioId = req.params.portfolioId;
    
    try{
       
        let portfolioDb = await Portfolio.findOne({where:{portfolio_id:portfolioId}});
        let thumbImageDb = await Image.findOne({where:{image_id:portfolioDb.thumb_image}});
        
        //delete thumb image from file
        let thumb_image = thumbImageDb.image;
        await deleteFile(thumb_image);
        // delete thumb image from db
        await Image.destroy({where:{image_id:portfolioDb.thumb_image}});
        
        let portfolioImagesDb = await PortfolioImages.findAll({where:{portfolio_id:portfolioId}});
        let images = [],image;

        //make wait foreach
        await Promise.all(portfolioImagesDb.map(async (portImage) => {
            image = await Image.findOne({attributes:["image_id","image"],
                                               where:{image_id:portImage.image_id}});
            images.push(image);
        }));
         
        //delete portfolio images
        await Promise.all(images.map(async (image) => {
            // remove from file
            
            //fsExtra.unlink(path.join(__dirname,"../../",'public', 'resources','images',"portfolio",image.image));
            
            await deleteFile(image.image);
            //remove from db
            await Image.destroy({where:{image_id:image.image_id}});
        }));

        //remove portfolio images from db 
        await PortfolioImages.destroy({where:{portfolio_id:portfolioId}});
        //remove portfolio
        await Portfolio.destroy({where:{portfolio_id:portfolioId}});

        res.status(statusCodes.OK)
           .json(response("success","portfolio removed"));
        

    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
}

exports.deletePortfolioImage = async (req,res)=>{

    let image = req.params.image;
    let portfolioId = req.params.portfolioId;
    
    try{
       
        await deleteFile(image);
        // fsExtra.unlink(path.join(__dirname,"../../",'public', 'resources','images',"portfolio",image));
        
        
        let imageResult = await Image.findOne({where:{image:image}});

        await PortfolioImages.destroy({where:{image_id:imageResult.image_id,
                                              portfolio_id:portfolioId}});
                                    
        await Image.destroy({where:{image:image}});
       

        res.status(statusCodes.OK)
           .json(response("success","deleted portfolio image"));
        

    }catch(error){
        console.log(error);
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
}


async function uploadThumbImage(file){
    let id = await uuidv4()
    let fileName = id+path.extname(file.name);
     
    const savePath = path.join(__dirname,"../../","tmp",fileName);
    
    
    if(file.truncated){
        fsExtra.emptyDirSync(path.join(__dirname,"../../","tmp"));
  
        return {status:"error",message:"file size is too big (5 mb is  max size)"};
  
    }
     
    if(file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png'){
        fsExtra.emptyDirSync(path.join(__dirname,"../../","tmp"));
        return {status:"error",message:"only jpegs and png supported"};
    }
    


    await file.mv(savePath);
    //fsExtra.emptyDirSync(path.join(__dirname,"../../","tmp"));    

    return {status:"success",message:{image:fileName,type:file.mimetype,size:file.size}};
}

async function uploadSinglePortfolioImage(file){
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
    //fsExtra.emptyDirSync(path.join(__dirname,"../../","tmp"));    

    return {status:"success",message:{image:fileName,type:file.mimetype,size:file.size}};
}


const handleFileUpload =  (uploads) => {
      let fileName,savePath,images=[],id;
      
     
      uploads.forEach(async upload => {
        
        id = await uuidv4();
        fileName = id+path.extname(upload.name);
        savePath = path.join(__dirname,"../../",'tmp',fileName);
        upload.mv(savePath);
        images.push({image:fileName,type:upload.mimetype,size:upload.size})
      });
     
      return {status:"success",message:images};

};
