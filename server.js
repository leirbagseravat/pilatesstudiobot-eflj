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

 //response.json({"fulfillmentText" : "Previsao do xxxx tempo agora..."});
  
 var intentName = request.body.queryResult.intent.displayName;
  
 if (intentName == "temperatura") {
   
    var cidade  = request.body.queryResult.parameters['cidade'];

    //response.json({"fulfillmentText" : "Previsao do tempo para " + cidade});
// }
    helper.getCurrentWeatherByCityName("" + cidade, (err, currentWeather) => {
	    if (err) {
		    console.log(err);
        
        response.json({"fulfillmentText": "Cidade ''" +  cidade + " '' nao encontrada"});
	    }
	    else {
	     	console.log(currentWeather);
        
         var temperaturaAtual  = currentWeather.main.temp;
         var temperaturaMaxima = parseInt(currentWeather.main.temp_max);
         var temperaturaMinima = parseInt(currentWeather.main.temp_min);
       
        
        /*response.json({"fulfillmentText" :
          "Cidade: " + currentWeather.name + "\n" +
          "Temperatura Atual: " + temperaturaAtual + "º" + "\n" +
          "Temperatura Máxima: " + temperaturaMaxima + "º" + "\n" +
          "Temperatura Mínima: " + temperaturaMinima

        });*/
        response.json({"fulfillmentMessages":
           [
            {
              "card": {
                 "title": "Previsão do Tempo",
                 "subtitle": "Cidade = " + currentWeather.name,
                  "imageUri": "https://cdn.glitch.com/ed90767e-7d31-49a0-944f-1e1f4f07b572%2Fprevisao.png?v=1615465390523"
              }
            },
            {
             "text" :{
                "text": ["Temperatura atual = " + temperaturaAtual + "º"]
             }
            },
            {
             "text" :{
                "text": ["Temperatura máxima = " + temperaturaMaxima + "º"]
             }
            },
            {
             "text" :{
                "text": ["Temperatura mínima = " + temperaturaMinima + "º"]
             }
            }
             
           ]
        });
        
	    }
    });
  }

});




  




// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
