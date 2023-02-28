const router = require('express').Router();

const {authenticateUser} = require('../../middleware/user-authentication.middleware');
const {authenticateFrontend} = require('../../middleware/frontend-authentication.middleware');
const {validateContacts,
       validationStatus} = require("../../middleware/validation.middleware");

const contactController  = require("../../controllers/contacts.controller");

//only frontend user has allowed to create this resource
router.post('/',authenticateFrontend,
                validateContacts(),
                validationStatus,
                contactController.addContact);

router.get('/',authenticateUser,
                contactController.getContacts);

router.delete('/:contactId',authenticateUser,
                contactController.deleteContact);

module.exports = router;