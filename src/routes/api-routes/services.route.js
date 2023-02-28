const router = require('express').Router();

const {authenticateUser} = require('../../middleware/user-authentication.middleware');
const {authenticateFrontend} = require('../../middleware/frontend-authentication.middleware');
const {validateServices,
       validationStatus} = require("../../middleware/validation.middleware");

const servicesController = require("../../controllers/services.controller");


router.post('/',authenticateUser,
                validateServices(),
                validationStatus,
                servicesController.addService);

router.get("/",authenticateUser,
                servicesController.getServices);
router.get("/frontend",authenticateFrontend,
                servicesController.getServices);
router.get("/:serviceId",authenticateUser,
                        servicesController.getService);

router.put("/:serviceId",authenticateUser,
                        validateServices(),
                        validationStatus,
                        servicesController.editService);

router.delete("/:serviceId",authenticateUser,
                  servicesController.deleteService)



module.exports = router;