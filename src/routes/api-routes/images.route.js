const router = require('express').Router();

const {authenticateUser} = require('../../middleware/user-authentication.middleware');
const {authenticateFrontend} = require('../../middleware/frontend-authentication.middleware');
const {loginCheck,
       validateServices,
       validationStatus} = require("../../middleware/validation.middleware");

const imageController  = require("../../controllers/images.controller");


router.post('/pc',authenticateUser,
                imageController.addSliderImage);

router.post('/mobile',authenticateUser,
                     imageController.addSliderImage);


router.get("/",authenticateUser,
                     imageController.getSliderFrontendImages);

router.get("/pc",authenticateFrontend,
               imageController.getSliderImages);

router.get("/mobile",authenticateFrontend,
                     imageController.getSliderImages);


router.delete("/:imageId",authenticateUser,
                  imageController.deleteSliderImage);




module.exports = router;