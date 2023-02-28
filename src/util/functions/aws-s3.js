require("dotenv").config();
const AWS = require('aws-sdk');
const path = require("path");
const fsExtra = require("fs-extra");
const fs = require("fs");
// Enter copied or downloaded access ID and secret key here
const ID = process.env.S3_BUCKET_ID;
const SECRET = process.env.S3_BUCKET_SECRET;

// The name of the bucket 
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});

const uploadFile = async (file) => {
    return  new Promise(async (resolve,reject)=>{

        let filePath = path.join(__dirname,"../","../","../","tmp");
        
        const fileContent = fs.readFileSync(`${filePath}/${file}`);
        const params = {Bucket: `${BUCKET_NAME}/images`,
                        Key:file, // File name you want to save as in S3
                        Body: fileContent};

        s3.upload(params, function (err,data) { 
            
            //fsExtra.emptyDirSync(filePath);

            if(err) reject({status:"error",message:err.message});
            
            resolve({status:"success",message:data});
        });
    });
}

const uploadBatchFiles = async (file) => {
    return  new Promise(async (resolve,reject)=>{

        let filePath = path.join(__dirname,"../","../","../","tmp");
        
        const fileContent = fs.readFileSync(`${filePath}/${file}`);
        const params = {Bucket: `${BUCKET_NAME}/images`,
                        Key:file, // File name you want to save as in S3
                        Body: fileContent};

        s3.upload(params, function (err,data) { 
            

            if(err) reject({status:"error",message:err.message});
            
            resolve({status:"success",message:data});
        });
    });
}

const deleteFile = (fileName)=>{

    return new Promise(async (resolve,reject)=>{
        const params = {
            Bucket: `${BUCKET_NAME}/images`,
            Key:fileName,
           
        };
         
        s3.deleteObject(params, function(err, data) {
      
            if(err) reject({status:"error",message:err.message});

            resolve({status:"success",message:"file removed"});
        });

    })
   
}


module.exports = {uploadFile,uploadBatchFiles,deleteFile};