require("dotenv").config();
const statusCodes = require('../util/status-codes');
const response = require('../models/api/response.model');
const {writeLog} = require('../util/functions/write-log');
const generateJWTtoken = require("../util/functions/generate-jwt-token");

const {db,sequelize} = require("../models/db")
const Token = db.tokens;
const Gender = db.genders;

exports.getFrontEndToken = async (req,res)=>{
   
   try{
      

      let token = generateJWTtoken({date:new Date()},process.env.TOKEN_SECRET);
      await Token.create({
         token:token,
         type:"FRONTEND",
         active:true
      })
 
      res.status(statusCodes.OK).json(response("success","token",{token}))


   }catch(error){

       writeLog(__dirname,error.message);
       
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(response("error",error.message));
   }
}

exports.deleteFrontEndToken = async (req,res)=>{
   
   try{
      

      await Token.destroy({where:{token:req.token}})
 
      res.status(statusCodes.OK).json(response("success","token removed"))


   }catch(error){

       writeLog(__dirname,error.message);
       
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(response("error",error.message));
   }
}

exports.getGenders = async (req,res)=>{
   
   try{
      

      let genders = await Gender.findAll({});
 
      res.status(statusCodes.OK).json(response("success","genders",{genders}))


   }catch(error){

       writeLog(__dirname,error.message);
       
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(response("error",error.message));
   }
}