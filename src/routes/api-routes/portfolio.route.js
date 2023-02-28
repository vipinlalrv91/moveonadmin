const router = require('express').Router();
const {authenticateUser} = require('../../middleware/user-authentication.middleware');
const {authenticateFrontend} = require('../../middleware/frontend-authentication.middleware');

const {validateContacts,
       validatePortfolio,
       validationStatus} = require("../../middleware/validation.middleware");

const portFolioController  = require("../../controllers/portfolio.controller");


router.post("/",authenticateUser,
                validatePortfolio(),
                validationStatus,
                portFolioController.addPortfolio);

router.post("/:portfolioId/add-images",authenticateUser,
                                       portFolioController.addPortfolioImages);

router.get("/frontend",authenticateFrontend,
                      portFolioController.getPortfolios);
router.get("/",authenticateUser,
              portFolioController.getPortfolios);

router.get("/:hexId/images",authenticateUser,
                               portFolioController.getPortfolioImages);
router.get("/:hexId/images/frontend",authenticateFrontend,
                                    portFolioController.getPortfolioImages);

router.put("/:portfolioId",portFolioController.updatePortfolio);

router.delete("/:portfolioId/:image",portFolioController.deletePortfolioImage);

router.post("/:portfolioId/add-image-to-album",portFolioController.addImageToAlbum);

router.delete("/:portfolioId",authenticateUser,portFolioController.deletePortfolio);
module.exports = router;