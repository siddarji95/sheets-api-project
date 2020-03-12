const {google} = require('googleapis')

const keys = require('./keys.json')

const client = new google.auth.JWT(
    keys.client_id,null ,keys.client_secret,['https://www.googleapis.com/auth/spreadsheets']
);

client.authorize(function(err,tokens){
   
    if(err){
        console.log(err)
    }
    else{
        console.log('connected')
    }
 

});