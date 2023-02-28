const fs = require("fs");
const path =require("path");
//check if there a 
//log.txt file exists
//and create one if not
(async function() {
   let logFile = "app-log.txt";
   let filePath = path.join(__dirname,"../","../","../","public/logs",logFile); 
   let fileCheckResult = await fs.existsSync(filePath);

   if (!fileCheckResult) {
    fs.writeFile(filePath,"",function(){});
   } 

})();



module.exports ={
    writeLog:(file=__filename,errorMessage="")=>{
        
        let timeNow = Date(Date.now());
        let log = `=>${timeNow}\n  file= ${file}  \n   error= ${errorMessage}\n\n`;
        
  
        let  logFile = "app-log.txt";
        
        fs.appendFile(`public/logs/${logFile}`,log, function(err){
            // Deal with possible error here.
            if(err){
                console.log(err.message);
                return err.message;
            } 
        });
    }
}