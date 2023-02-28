const path = require("path");
//api response models
const healthResponseModel = require("../models/api/health-response.model");
const responseModel = require("../models/api/response.model");

//status codes
const statusCodes = require("../util/status-codes");


function  initializeBaseRoutes(app){
    
    //application base
    app.get("/api",(req,res)=> res.json(responseModel("success",
                                                   "at application base")));

    //application health check 
    app.get("/api/check-health",(req,res)=>res.json(healthResponseModel()));
    

    //get logs
    app.get("/api/app-log/:token",(req,res)=>{
        
        const logAccessToken = process.env.LOG_ACCESS_TOKEN;
        let token = req.params.token;

        if(logAccessToken !== token) return res.status(statusCodes.FORBIDDEN)
                                               .json(responseModel("failed",
                                                                   "you don't have access to this resource"));

        try{
        
            res.sendFile(path.join(__dirname,"../../public/logs/app-log.txt"));

        }catch(error){
            res.status(statusCodes.internal_server_error)
               .json(responseModel("error",
                                   error.message));
        }
        })

}

function  initializeApplicationRoutes(app){
    
    //custom routers
    app.use("/",require("./view-routes"))
    
    //api
    app.use("/api/users",require("./api-routes/user.route"))
    app.use("/api/services",require("./api-routes/services.route"))
    app.use("/api/images",require("./api-routes/images.route"))
    app.use("/api/contacts",require("./api-routes/contacts.route"))
    app.use("/api/portfolios",require("./api-routes/portfolio.route"))
    app.use("/api/util",require("./api-routes/util.route"))
    app.use("/api/enquiry",require("./api-routes/enquiry.route"));
    app.use("/api/about-me",require("./api-routes/about-me.route"));
   //always call use at the bottom 
   //error catching route
    app.all("*", (req, res) => res.render("error"));

    }

module.exports = {initializeBaseRoutes,initializeApplicationRoutes}