const {body,param,query,validationResult} = require("express-validator");
const statusCodes = require("../util/status-codes");
const response = require("../models/api/response.model");


const loginCheck = ()=>{
    return [
        body("email", "not a valid email id").trim().isEmail(),
        body("password","provide a password with at least six characters").isLength({ min:6})]
}

const validateServices = ()=>{
    return [
        body("title", "required").trim().not().isEmpty(),
        body("shortTitle", "required").trim().not().isEmpty(),
        body("description", "required").trim().not().isEmpty()]
}

const validateContacts = ()=>{
    return [
        body("name", "required").trim().not().isEmpty(),
        body("email", "not a valid email id").trim().isEmail(),
        body("phone", "required").trim().not().isEmpty(),
        body("message", "required").trim().not().isEmpty()]
}

const validatePortfolio = ()=>{
    return [
        body("shortTitle", "required").trim().not().isEmpty(),
        body("title", "required").trim().not().isEmpty()]
}

const validateEnquiryBasic = ()=>{
    return [
        body("name", "required").trim().not().isEmpty(),
        body("email", "not a valid email id").trim().isEmail(),
        body("genderId", "not a valid id").trim().isNumeric({min:5,max:5}),
        body("age", "required").trim().isNumeric({min:3,max:3}),
        body("phone", "required").trim().not().isEmpty(),
        body("nationality", "required").trim().not().isEmpty(),
        body("address", "required").trim().not().isEmpty(),
        body("parentAccompanied", "required").trim().not().isEmpty(),
        body("socialMedia", "required").trim().not().isEmpty()]
}

const validateEnquiryBodyMeasurements = ()=>{
    return [
        body("height", "required").trim().isNumeric({min:3,max:3}),
        body("hairColor", "required").trim().not().isEmpty(),
        body("weight", "required").trim().isNumeric({min:3,max:3}),
        body("waist", "required").trim().isNumeric({min:3,max:3}),
        body("hip", "required").trim().isNumeric({min:3,max:3}),
        body("chest", "required").trim().isNumeric({min:3,max:3})]
}

const validateAboutMe = ()=>{
    return [
        body("title", "required").trim().not().isEmpty(),
        body("shortTitle", "required").trim().not().isEmpty(),
        body("description", "required").trim().not().isEmpty()]
}





const validationStatus = (req,res,next)=>{
  const errors = validationResult(req);
  if(errors.isEmpty()){
      return next();
  }
 

  const extractedErrors = []
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

  return res.status(statusCodes.UNPROCESSABLE_ENTITY)
            .json(response("failed","validation errors",{ errors: extractedErrors}));
}

module.exports = {
    validationStatus,
    validateServices,
    loginCheck,
    validatePortfolio,
    validateEnquiryBasic,
    validateContacts,
    validateEnquiryBodyMeasurements,
    validateAboutMe}