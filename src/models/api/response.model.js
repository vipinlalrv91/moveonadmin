const responseCodes = require("../../util/status-codes")
const response = (status = "success",message = "OK",data = null) => 
({
  //status can be success failed or error
  status,message,data});

module.exports = response;