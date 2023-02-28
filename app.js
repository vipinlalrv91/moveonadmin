require("dotenv").config();
const express = require("express");
const cors = require("cors");
const moran = require("morgan");
const app = express();
const port = process.env.PORT;
const appName = require("./src/config/app.config").program;
const routes = require("./src/routes");
const fileUpload = require("express-fileupload");
const path = require("path");
const compressor = require("compression");
const limitRequest = require("express-rate-limit");
const response = require("./src/models/api/response.model");

// view engine setup
app.set('views', path.join(__dirname,"src",'views'));
app.set('view engine', 'ejs');

//configure node app
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use(moran('tiny')); //logs time of request and response
app.use(express.static('public'));//share the public files
//limiting concurrent request's 
//to prevent DOS and DOSS attacks
//maximum 10 request in 30 seconds
// app.use(limitRequest({
//     windowMs: 15 * 60 * 1000, // 15 minutes
// 	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
//     message:response(false,"too many requests. try after sometime")
// }));




//using compressor package to 
//decrease payload size
app.use(compressor());

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, 'tmp'),
    createParentPath: true,
    limits: { fileSize: 1024 * 1024 * 5 },//5mb max file size
}));


routes.initializeBaseRoutes(app);



routes.initializeApplicationRoutes(app);


app.listen(port,()=>console.log(`\n${appName} is running on ${port}`));