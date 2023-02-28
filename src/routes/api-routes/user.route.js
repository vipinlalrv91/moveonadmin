const router = require('express').Router();

const {authenticateUser} = require('../../middleware/user-authentication.middleware');
const {loginCheck,
       validationStatus} = require("../../middleware/validation.middleware");

const userController = require("../../controllers/users.controller");

router.post("/login",loginCheck(),
                    validationStatus
                    ,userController.login)

router.get("/",authenticateUser,userController.getUsers);

router.delete("/logout",authenticateUser,userController.logout);

module.exports = router;