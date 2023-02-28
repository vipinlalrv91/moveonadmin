require("dotenv").config();
const statusCodes = require('../util/status-codes');
const response = require('../models/api/response.model');
const {writeLog} = require('../util/functions/write-log');

const md5= require("md5");

const generateJWTtoken = require("../util/functions/generate-jwt-token");
//db
const {db,sequelize} = require("../models/db");
const User = db.users;
const Token = db.tokens;

exports.login = async (req,res)=>{
    let email = req.body.email;
    let password = req.body.password;
    password = md5(password);

    try{
      
        let user = await User.findOne({where:{email,password}});

        if(!user) return res.status(statusCodes.NOT_ACCEPTABLE)
                            .json(response("failed","invalid credentials"));

        //generate token and login user 
        let payload = {
            userId:user.user_id,
            userType:user.user_type}

        let token = generateJWTtoken(payload,process.env.TOKEN_SECRET);
        
        await Token.create({
            token,
            type:"AUTHENTICATION"});

        res.status(statusCodes.OK)
           .json(response("success",
                          "user logged in successfully",
                          {token}));

        

       
    }catch(error){
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}

exports.getUsers = async (req,res)=>{
   
    try{
      
        let users = await User.findAll({});

        res.status(statusCodes.OK)
           .json(response("success",
                          "users",
                          {users}));

        

       
    }catch(error){
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}

exports.logout = async (req,res)=>{
    let token = req.token;
   

    try{
      
        await Token.destroy({where:{token}});

        res.status(statusCodes.OK)
           .json(response("success",
                          "user logged out successfully",
                          {token}));

        

       
    }catch(error){
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}