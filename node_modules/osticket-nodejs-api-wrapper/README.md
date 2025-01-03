# osTicket API - NodeJS Wrapper
The osTicket open source ticketing system is nice for creating support tickets. This module is a wrapper for nodeJS. Include this package in your project to easily create new support tickets with your own self-hosted osTicket server installation.
### Requirements

You  must have osTicket installed and generate your osTicket API Key inside the osTicket software before attempting to connect with this wrapper module.

* [osTicket](https://github.com/osTicket/osTicket) - The osTicket open source ticketing system

### Options
The property **topicId** in your formData is optional but very helpful if you wish to automatically organize 
incoming support ticket requests. You must setup your different Help Topics directly inside osTicket 
settings. If you decide to use this feature you must modify the osticket-api.js included in this NPM.
Go to the requestData object and edit the switch statement to match the different dropdown
support ticket options you wish to offer your users. Each option must be associated with the corresponding
osTicket Help Topic ID number that was assigned when you created the Help Topic inside the osTicket settings.

### Example module Usage
```javascript
const osTicketAPI = require('osticket-nodejs-api-wrapper');

var formData = {
    name : 'John Doe',
    email : 'john@doe.com',
    subject: 'SUPPORT TICKET REQUEST',
    message: 'I am creating a new support ticket request, please help me!',
    topicId : 'General Questions'
};

osTicketAPI({
    API_KEY : 'YOUR_OSTICKET_API_KEY', // The API key created inside the osTicket settings.
    INSTALL_URL_PATH : 'http://YOUR_OSTICKET_SERVER_URL/support', // URL path of your osTicket server installation.
    ALERT : true, 
    AUTO_RESPOND : true
}, formData, function(err, osTicketId){
    if(!err)
        console.log("Your osTicket Support Ticket ID #", osTicketId);
    else
        console.log("Error creating support ticket! ", err);
});
```