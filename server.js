const express = require("express");
const app = express();


var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(express.static("public"));

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore({ projectId: credentials.project_id, credentials });
const clientsRef = db.collection('clients');


    function addAppointmentToClient(request, response) {
        const person = request.body.queryResult.parameters.person;
        const phone = request.body.queryResult.parameters.telefone;

        let day = new Date(request.body.queryResult.parameters.dia);
        let hour = new Date(request.body.queryResult.parameters.horario);

        day.setHours(hour.getHours(), hour.getMinutes());

        return clientsRef.where('phone', '==', phone).get().then((documents) => {
            if (documents.size > 0) {
                documents.forEach((doc) => {
                    const res = doc.data();
                    let appoint = res.appointments;
                    appoint.push(day);
                    clientsRef.doc(doc.id).update({ appointments: appoint });
                });
            } else {
                clientsRef.add({name: person.name, appointments: [day], phone: phone});
            }

            return response.json({
                "fulfillment_messages": [{
                    "payload": {
                        "richContent": [
                            [{
                                "title": "Agendamento criado",
                                "type": "description",
                                "text": [
                                    'Perfeito! ' + person.name + ' foi agendado com sucesso no dia \n\n\n'+ day.toLocaleString('es-ES', {timeZone: 'America/Sao_Paulo'})+ ' e o telefone cadastrado na reserva foi o ' + phone
                                ]
                            }]
                        ]
                    }
                }]});
        });
    }

    function listAppointments(request, response) {
        const phone = request.body.queryResult.parameters.telefone;

        return clientsRef.where('phone', '==', phone).get().then((documents) => {
            if (documents.size > 0) {
                documents.forEach((doc) => {
                    const res = doc.data();
                    let appointments = res.appointments;

                    if(appointments.length > 0) {
                        let response = 'Os seguintes horários foram agendados neste telefone:';
                        for (var appoint in appointments) {
                            response = response + '\n\n' + appointments[appoint].toDate().toLocaleString('es-ES', { timeZone: 'America/Sao_Paulo' });
                        }
                        return response.json({
                            "fulfillment_messages": [{
                                "payload": {
                                    "richContent": [
                                        [{
                                            "title": "Agendamentos",
                                            "type": "description",
                                            "text": [
                                                response
                                            ]
                                        }]
                                    ]
                                }
                            }]});
                    } else {
                        return response.json({
                            "fulfillment_messages": [{
                                "payload": {
                                    "richContent": [
                                        [{
                                            "title": "Agendamentos não encontrado",
                                            "type": "description",
                                            "text": [
                                                `Nenhum horário foi reservado para o número informado.  Digite "Agendar aula" para criar um apontamento`                                            ]
                                        }]
                                    ]
                                }
                            }]});
                    }
                });
            } else {
                return response.json({
                    "fulfillment_messages": [{
                        "payload": {
                            "richContent": [
                                [{
                                    "title": "Usuário não encontrado",
                                    "type": "description",
                                    "text": [
                                        `Desculpe, não achamos nenhum cadastro com o número informado. Digite "Agendar aula" para criar um apontamento`                                            ]
                                }]
                            ]
                        }
                    }]});            }
        });
    }


    function deleteAppointment(request, response) {
        const phone = request.body.queryResult.parameters['phone-number'];
        const dia = request.body.queryResult.parameters.dia;
        const horario = request.body.queryResult.parameters.horario;

        let targetDate = new Date(dia);
        let targetHour = new Date(horario);
        targetDate.setHours(targetHour.getHours(), targetHour.getMinutes());

        return clientsRef.where('phone', '==', phone).get().then((documents) => {
            if (documents.size > 0) {
                documents.forEach((doc) => {
                    const res = doc.data();
                    let appointments = res.appointments;

                    let indexToDelete = -1;
                    for (let i = 0; i < appointments.length; i++) {
                        if (appointments[i].getTime() === targetDate.getTime()) {
                            indexToDelete = i;
                            break;
                        }
                    }

                    if (indexToDelete >= 0) {
                        appointments.splice(indexToDelete, 1);
                        clientsRef.doc(doc.id).update({ appointments: appointments });
                        return response.json({
                            "fulfillment_messages": [{
                                "payload": {
                                    "richContent": [
                                        [{
                                            "title": "Agendamento cancelado com sucesso",
                                            "type": "description",
                                            "text": [
                                                `O agendamento no dia ${targetDate.toLocaleString('es-ES', { timeZone: 'America/Sao_Paulo' })} foi cancelado com sucesso.`                                         ]
                                        }]
                                    ]
                                }
                            }]});
                    } else {
                        return response.json({
                            "fulfillment_messages": [{
                                "payload": {
                                    "richContent": [
                                        [{
                                            "title": "Agendamento não encontrado",
                                            "type": "description",
                                            "text": [
                                                `Não foi encontrado nenhum agendamento no dia ${targetDate.toLocaleString('es-ES', { timeZone: 'America/Sao_Paulo' })}.`                                            ]
                                        }]
                                    ]
                                }
                            }]});
                    }
                });
            } else {
                return response.json({
                    "fulfillment_messages": [{
                        "payload": {
                            "richContent": [
                                [{
                                    "title": "Usuário não encontrado",
                                    "type": "description",
                                    "text": [
                                        `Desculpe, não achamos nenhum cadastro com o número informado. Digite "Agendar aula" para criar um apontamento`                                            ]
                                }]
                            ]
                        }
                    }]});

            }
        });
    }
app.post("/pilatesStudio", function(request, response) {
 var intentName = request.body.queryResult.intent.displayName;

    if (intentName === "Agendar") {
        return addAppointmentToClient(request, response);
    }

    if (intentName === "Listar") {
        return listAppointments(request, response);
    }

    if (intentName === "DeletetarAgendamento") {
        return deleteAppointment(request, response);
    }

    if(intentName === "Default Fallback Intent"){
        logData("ERROR",`Interação nao esperada: ${request.body.queryResult.queryText}`)
    }

});




  




// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
