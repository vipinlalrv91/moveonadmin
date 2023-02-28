const express = require('express');
const router = require('express').Router();
const viewController = require("../../controllers/view.controller");
// const {authenticateUser} = require('../../middleware/authentication.middleware');


router.get("/",viewController.getHomePage);
router.get("/enquires",viewController.getEnquiryPage);
router.get("/enquires/:enquiryId",viewController.getEnquiryDetailPage);
router.get("/contacts",viewController.getContactsPage);
router.get("/users",viewController.getUsersPage);
router.get("/profile",viewController.getProfilePage);
router.get("/login",viewController.getLoginPage);

router.get("/frontend-management/home",viewController.getCMShomePage);
router.get("/frontend-management/home/view",viewController.getCMShomePageItems);
router.get("/frontend-management/services",viewController.getCMSservicesPage);
router.get("/frontend-management/services/view",viewController.getCMSservicesPageItems);
router.get("/frontend-management/portfolios",viewController.getCMSPortfolioPage);
router.get("/frontend-management/portfolios/view",viewController.getCMSPortfolioPageItems);
router.get("/frontend-management/about-me",viewController.getCMSAboutMePage);





module.exports = router;