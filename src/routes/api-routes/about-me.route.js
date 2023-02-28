const router = require('express').Router();

const {authenticateUser} = require('../../middleware/user-authentication.middleware');
const {authenticateFrontend} = require('../../middleware/frontend-authentication.middleware');
const {validateAboutMe,
       validationStatus} = require("../../middleware/validation.middleware");

const  aboutMeController= require("../../controllers/about-me.controller");


router.put('/',authenticateUser,
                validateAboutMe(),
                validationStatus,
                aboutMeController.updateAboutMe);

router.put('/signature-image',authenticateUser,
                aboutMeController.updateSignatureImage);

router.get("/",authenticateUser,
               aboutMeController.fetchAboutMe);

router.get("/frontend",authenticateFrontend,
               aboutMeController.fetchAboutMe);



module.exports = router;