module.exports = function (osTicketAPI_settings, formData, callback) {
    var request = require('request'),
        requestData = {
            "alert" : osTicketAPI_settings.ALERT,
            "autorespond" : osTicketAPI_settings.AUTO_RESPOND, 
            "source" : "API", 
            "name" : formData.name,
            "email" : formData.email, 
            "subject" : formData.subject, 
            "message" : formData.message,
            "topicId" : function(){
                // Here you can setup your different Help Topics. They must be setup in osTicket.
                // Set the return value to the id number of the topic that was generated in osTicket.
                // For example:
                switch(formData.topicId){
                    case "General Questions":
                        return 1;
                    case "Other":
                        return 2;
                }   
            }()
        };
    request.post({
        url: osTicketAPI_settings.INSTALL_URL_PATH + '/api/http.php/tickets.json',
        json: true,
        headers: {
            "X-API-Key": osTicketAPI_settings.API_KEY
        },
        body: requestData
    }, function(error, response, osTicket_supportTicketID) {
            if(!error){
                callback(null, osTicket_supportTicketID);
            }
            else
                callback(error, null);
        });
}
