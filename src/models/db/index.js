require("dotenv").config();
let environment = process.env.ENVIRONMENT;
const dbConfig = require("../../config/db-config")

const {Sequelize,DataTypes} = require("sequelize");
const {writeLog} = require("../../util/functions/write-log");

// new Sequelize('db', 'username', 'password', {
const sequelize = new Sequelize(dbConfig.database,dbConfig.user,dbConfig.password, {
  host:dbConfig.host,
  dialect:"mysql",
  operatorAliases:0,
  pool:{
    max:5,
    min:0,
    acquire:30000,
    idle:10000},
    logging:false
});


sequelize.authenticate()
         .then(()=> console.log("connected to database..."))
         .catch(error =>{
           writeLog(__dirname,error.message)
           console.log(error);

         });

const db = {}

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//models 
db.users = require("./users.model")(sequelize,DataTypes);
db.conceptImages = require("./concept-images.model")(sequelize,DataTypes);
db.contact = require("./contact.model")(sequelize,DataTypes);
db.enquiryImages = require("./enquiry-images.model")(sequelize,DataTypes);
db.enquiries = require("./enquiry.model")(sequelize,DataTypes);
db.genders = require("./gender.model")(sequelize,DataTypes);
db.images = require("./image.model")(sequelize,DataTypes);
db.portfolioImages = require("./portfolio-images.model")(sequelize,DataTypes);
db.portfolios = require("./portfolios.model")(sequelize,DataTypes);
db.services = require("./services.model")(sequelize,DataTypes);
db.tokens = require("./tokens.model")(sequelize,DataTypes);
db.aboutMe = require("../db/about-me.model")(sequelize,DataTypes);


//this line is very important because 
//every time the server runs data get lost if it's set 
//to false

// db.sequelize.sync({force:false})
//             .then(()=>console.log("application re-syncing"))
//             .catch(error=>console.log(error));




            
    
module.exports = {db,sequelize};