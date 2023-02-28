require('dotenv').config();
const jwt = require('jsonwebtoken');
 
const statusCodes = require("../util/status-codes");
const response = require("../models/api/response.model");
const {db}  = require("../models/db");
const Tokens = db.tokens



async function authenticateFrontend(req,res,next){
    
    //getting token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1]; //either undefined or the token
    
    
    if(!token){
       return res.status(statusCodes.NOT_FOUND)
                 .json(response("failed","token not found"));
    }else{
        
        let tokenResult = await Tokens.findOne({where:{token,type:'FRONTEND'}});
        
        if(!tokenResult) return res.status(statusCodes.NOT_ACCEPTABLE)
                                   .json(response("failed","invalid token"));
        
        jwt.verify(token,process.env.TOKEN_SECRET,(error,user)=>{
            
            if(error) return res.status(statusCodes.NOT_ACCEPTABLE)
                                .json(response("failed","invalid token"));

            req.user = user ;
            req.token = token;

            next();

        })
            
    }
    
}




module.exports = {authenticateFrontend};