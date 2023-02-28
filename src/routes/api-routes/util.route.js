const router = require('express').Router();

const {authenticateFrontend} = require('../../middleware/frontend-authentication.middleware');


const utilController = require("../../controllers/util.controller");

router.get("/frontend-token",utilController.getFrontEndToken);

router.get("/genders",authenticateFrontend,utilController.getGenders);
router.delete("/frontend-token",authenticateFrontend,utilController.deleteFrontEndToken);

module.exports = router;