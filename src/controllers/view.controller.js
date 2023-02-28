require('dotenv').config();
const statusCodes = require('../util/status-codes');
const response = require('../models/api/response.model');
const {writeLog} = require('../util/functions/write-log');
const axios = require("axios");
let url = process.env.BASE_URL;


exports.getHomePage = (req,res)=>{
   
   try{


      res.render('home',{url:url});
      

   }catch(error){

       writeLog(__dirname,error.message);
       
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(response("error",error.message));
   }
}

exports.getEnquiryPage = (req,res)=>{

   try{


      res.render('enquires',{url:url});


   }catch(error){

       writeLog(__dirname,error.message);
       
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(response("error",error.message));
   }
}

exports.getEnquiryDetailPage = (req,res)=>{

   try{


      res.render('enquiry-detail',{url:url,enquiryId:req.params.enquiryId});


   }catch(error){

       writeLog(__dirname,error.message);
       
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(response("error",error.message));
   }
}

exports.getContactsPage = (req,res)=>{

   try{


      res.render('contacts',{url:url});


   }catch(error){

       writeLog(__dirname,error.message);
       
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(response("error",error.message));
   }
}

exports.getCMShomePage = (req,res)=>{

   try{


      res.render('frontend/home',{url:url,});


   }catch(error){

       writeLog(__dirname,error.message);
       
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(response("error",error.message));
   }
}

exports.getCMShomePageItems = (req,res)=>{

   try{


      res.render('frontend/home-items',{url:url});


   }catch(error){

       writeLog(__dirname,error.message);
       
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(response("error",error.message));
   }
}

exports.getCMSservicesPage = (req,res)=>{

   try{


      res.render('frontend/services',{url:url});


   }catch(error){

       writeLog(__dirname,error.message);
       
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(response("error",error.message));
   }
}

exports.getCMSservicesPageItems = (req,res)=>{

   try{


      res.render('frontend/service-items',{url:url});


   }catch(error){

       writeLog(__dirname,error.message);
       
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(response("error",error.message));
   }
}

exports.getCMSPortfolioPage = (req,res)=>{

   try{


      res.render('frontend/portfolio',{url:url});


   }catch(error){

       writeLog(__dirname,error.message);
       
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(response("error",error.message));
   }
}

exports.getCMSPortfolioPageItems = (req,res)=>{

   try{


      res.render('frontend/portfolio-items',{url:url});


   }catch(error){

       writeLog(__dirname,error.message);
       
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(response("error",error.message));
   }
}

exports.getCMSAboutMePage = (req,res)=>{

   try{


      res.render('frontend/profile',{url:url});


   }catch(error){

       writeLog(__dirname,error.message);
       
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(response("error",error.message));
   }
}

exports.getCMSAboutMe = (req,res)=>{

   try{


      res.render('frontend/portfolio-items',{url:url});


   }catch(error){

       writeLog(__dirname,error.message);
       
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(response("error",error.message));
   }
}

exports.getUsersPage = async (req,res)=>{

   try{
      
     
      res.render('users',{url:url});


   }catch(error){

       writeLog(__dirname,error.message);
       
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(response("error",error.message));
   }
}

exports.getProfilePage = async (req,res)=>{

   try{
      
     
      res.render('profile',{url:url});


   }catch(error){

       writeLog(__dirname,error.message);
       
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(response("error",error.message));
   }
}

exports.getLoginPage = (req,res)=>{

   try{

      res.render('login',{url:url});


   }catch(error){

       writeLog(__dirname,error.message);
       
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(response("error",error.message));
   }
}