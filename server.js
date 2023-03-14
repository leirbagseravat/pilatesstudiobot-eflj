// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();


var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


const objetoTempo = require('openweathermap-node');

// For temperature in Fahrenheit use units=imperial
// For temperature in Celsius use units=metric
const helper = new objetoTempo(
	{
		APPID: 'd8ff33461e38363901c7cc712d49dca1',
		units: "metric"
	}
);



// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});


app.post("/aulaPLN", function(request, response) {

 response.json({"fulfillmentText" : "Previsao do tempo agora..."});
  
});



// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
