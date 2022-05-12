const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const https = require('https');

const app = express();

// here the css and the images are static so to use them we have to use another express function known as static 
app.use(express.static("public")); //now we have to keep the local files entirely in the public folder so that it can provide the server with relative links

app.use(bodyParser.urlencoded({extended:true}));

app.get('/',function(req,res){
    res.sendFile(__dirname + "/signup.html");
});

app.post("/",function(req,res){
    // using body parser
    const firstName = req.body.fName;
    const lastName = req.body.lName;
    const email = req.body.email;

    // the mailchimp api requires json file to execute but we have to create a object first to do the stringfy option

    // the way the variables are named are done seeing the sample json code and documentation in mailchimp
    const data = {
        members:[
            {
                email_address : email,
                status : "subscribed",
                merge_fields:{
                    FNAME : firstName,
                    LNAME : lastName
                }
            }
        ]
    };

    const jsonData = JSON.stringify(data);
    
    // x after us is replaced according to the api key we got where what number was after us
    const url = "https://us13.api.mailchimp.com/3.0/lists/74661ac286";

    // options are to be sent while posting data according to the node documentation
    const options = {
        method : 'POST',
        auth : 'Gourab:9d7dee00298e59eb05592a9fd98423f3-us13'
    }

    const request = https.request(url,options,function(response){
        if(response.statusCode === 200){
            res.sendFile(__dirname + "/success.html");
        }else{
            res.sendFile(__dirname + "/failure.html");
        }
        response.on('data',function(data){
            console.log(JSON.parse(data));
        })
    });

    // we are using the .write function to send the mailchimp servers our json data const
    // request.write(jsonData);
    request.end();
});

app.post('/failure',function(req,res){
    // this redirects the users to the home route to try again 
    res.redirect('/');
});

// now that we are rolling it in the heroku servers it won't be static anymore like 3000, so we let heroku choose the server it wants for us dynamically and the 3000 is for the local running of the app
app.listen(process.env.PORT || 3000,function(){
    console.log("Server is running on port 3000.");
});


// 9d7dee00298e59eb05592a9fd98423f3-us13 - api key
// 74661ac286 - audience id
// https://usX.api.mailchimp.com/3.0/lists/74661ac286
// x is to be replaced by the number after us in the api key , that basically specifies the us region 