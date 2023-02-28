const router = require('express').Router();

const {authenticateUser} = require('../../middleware/user-authentication.middleware');
const {authenticateFrontend} = require('../../middleware/frontend-authentication.middleware');
const {validateEnquiryBasic,
       validateEnquiryBodyMeasurements,
       validationStatus} = require("../../middleware/validation.middleware");

const enquiryController  = require("../../controllers/enquiry.controller");

router.post("/",authenticateFrontend,enquiryController.addEnquiry);

//only frontend user has allowed to create this resource
// router.post('/basic-data',authenticateFrontend,
//                 validateEnquiryBasic(),
//                 validationStatus,
//                 enquiryController.addPersonalDate);

// router.post('/:enquiryId/body-measurements/',authenticateFrontend, 
//                          enquiryController.addBodyMeasurements);

// router.post("/:enquiryId/theme",authenticateFrontend,
//                                 enquiryController.addTheme);

router.get("/",authenticateUser,
              enquiryController.getEnquiries);

router.get("/:enquiryId",authenticateUser,
                       enquiryController.getEnquiry);

router.get("/:enquiryId/images",authenticateUser,
                                  enquiryController.getImages);

router.get("/:enquiryId/theme-images",authenticateUser,
                                     enquiryController.getThemeImages);

router.get("/check-exists/:socialMediaId",enquiryController.checkSocialLinksExists);
router.get("/check-phone-exists/:phone",enquiryController.checkPhoneExists);
router.get("/check-email-exists/:email",enquiryController.checkEmailExists);

router.delete("/:enquiryId",authenticateUser,
                            enquiryController.deleteEnquiry);

module.exports = router;