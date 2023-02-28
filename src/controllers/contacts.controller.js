require("dotenv").config();
const statusCodes = require('../util/status-codes');
const response = require('../models/api/response.model');
const {writeLog} = require('../util/functions/write-log');


const {db,sequelize} = require("../models/db");
const Contact = db.contact;


exports.addContact = async (req,res)=>{
    

    try{
      
         await Contact.create({
            name:req.body.name,
            email:req.body.email,
            phone:req.body.phone,
            message:req.body.message});
       

        res.status(statusCodes.OK)
           .json(response("success",
                          "your query sent successfully,we will get back to you soon."));

        

       
    }catch(error){
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}

exports.getContacts = async (req,res)=>{
    

    try{
      
         let contacts = await Contact.findAll({order: [['createdAt', 'desc']],});
       

        res.status(statusCodes.OK)
           .json(response("success",
                          "contacts",
                          {contacts}));

        

       
    }catch(error){
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}

exports.deleteContact = async (req,res)=>{
    let contactId = req.params.contactId

    try{
      
         await Contact.destroy({where:{contact_id:contactId}})
       

        res.status(statusCodes.OK)
           .json(response("success",
                          "contact has removed"));

        

       
    }catch(error){
        writeLog(__dirname,error.message);
       
        res.status(statusCodes.INTERNAL_SERVER_ERROR)
           .json(response("error",error.message));
    }
    
}