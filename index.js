var express = require('express'),
    stylus = require('stylus'), 
    nib = require('nib'),
    oauth2 = require('salesforce-oauth2'),
    Promise = require('promise');;

var callbackUrl = "https://peaceful-temple-82262.herokuapp.com/callback",
    consumerKey = "3MVG9YDQS5WtC11ohwJgX.hgWow4yWuOj9JQYElS2UoDpGe7KjszkEeDoFlEG7KTYrOVicbU5umtvU92HQkWX",
    consumerSecret = "1830883559063076415";

var oPayload = '';

var app = express();

app.set('port', (process.env.PORT || 5000));

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
};

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
// app.use(express.logger('dev'))
app.use(stylus.middleware(
  { src: __dirname + '/public/stylesheets'
  , compile: compile
  }
));

app.use(express.static(__dirname + '/public'))

// app.get('/', function (req, res) {
//   res.render('index',
//   { title : 'Home' }
//   )
// });

console.log('<Mehdi>: pre OAuth stuff');

app.get("/", function(request, response) {
    var uri = oauth2.getAuthorizationUrl({
        redirect_uri: callbackUrl,
        client_id: consumerKey,
        scope: 'full'
    });

    console.log('<Mehdi>:Init Resp: ' + response);

    return response.redirect(uri);
});

app.get('/callback', function(request, response) {
    var authorizationCode = request.param('code');
    console.log('<Mehdi>: pre Async operation');
    var sPayload ='empty';
    oauth2.authenticate({
        redirect_uri: callbackUrl,
        client_id: consumerKey,
        client_secret: consumerSecret,
        code: authorizationCode
    }, function(error, payload) {
        /*

        The payload should contain the following fields:

        id                 A URL, representing the authenticated user,
                        which can be used to access the Identity Service.

        issued_at        The time of token issue, represented as the 
                        number of seconds since the Unix epoch
                        (00:00:00 UTC on 1 January 1970).

        refresh_token    A long-lived token that may be used to obtain
                        a fresh access token on expiry of the access 
                        token in this response. 

        instance_url    Identifies the Salesforce instance to which API
                        calls should be sent.

        access_token    The short-lived access token.


        The signature field will be verified automatically and can be ignored.

        At this point, the client application can use the access token to authorize requests 
        against the resource server (the Force.com instance specified by the instance URL) 
        via the REST APIs, providing the access token as an HTTP header in 
        each request:

        Authorization: OAuth 00D50000000IZ3Z!AQ0AQDpEDKYsn7ioKug2aSmgCjgrPjG...

        Note: Instance ID something like this: '_CanvasDemo'
        Breakdown: Instance ID Breakdown: '_<ApplicationName>:<Id>'
        */


        console.log( '<Mehdi>:Payload  ' + JSON.stringify(payload));
        console.log( '<Mehdi>:error  ' + JSON.stringify(error));
        sPayload = JSON.stringify(payload);
        oPayload = payload;
    });

    var aoPageData = {
        'pageData':[
            {   title   : 'Home'    },
            {   'okeys' : sPayload  }
        ]
    }

    // return response.render('index',{ title   : 'Home', conns : sPayload }); 
    // return response.render('index',{ title   : 'Home'});  LATEST
    return response.redirect('/index');
});

app.get('/index', function(request, response) {

    return response.render('index',{ title   : 'Home'});
});

// ****************** Attempt to Implement Prommise.js *******************
// function getOauthKeys(authorizationCode){
//     // sPayload = 'empty';

//     return new Promise(function(fulfill, reject){
//         oauth2.authenticate({
//             redirect_uri: callbackUrl,
//             client_id: consumerKey,
//             client_secret: consumerSecret,
//             code: authorizationCode
//             }, function(error, payload) {
//                 console.log( '<Mehdi>:Async Payload  ' + JSON.stringify(payload));
//                 console.log( '<Mehdi>:Async error  ' + JSON.stringify(error));
//                 sPayload = JSON.stringify(payload);       
//         }).done(function(res){
//             try{
//                 // console.log('<Mehdi>:Async res :' + res);
//                 // console.log('<Mehdi>:Async res parsed :' + JSON.parse(res));
//                 // console.log('<Mehdi>:Async res stringified: ' +  JSON.stringify(res));
//                 JSON.stringify(res.payload);
//             } catch(ex) {
//                 reject(ex);
//             }
//         }, reject);
//     });
// }
// ****************** Attempt to Implement Prommise.js *******************

app.get("/ajaxOauthKeys", function(req, res) {
    res.send(JSON.stringify(oPayload));
})


app.listen(app.get('port'), function() {
  console.log("<Mehdi> log: " + app.get('port'))
})
