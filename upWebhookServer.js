// This is the main script that runs on the cloud run instance
const http = require('http');
const crypto = require('crypto')
const upAPI = require("./upApiGetTransaction.js");
const upWebhookCreate = require("./upWebhookCreate.js")
const upWebhookList = require("./upWebhookList.js")
const hostname = '0.0.0.0';
const port = process.env['PORT'] || 80;


// Create http server to listen to webhook
var data = '';
const server = http.createServer((req, res) => {
  console.log("Request Received");
  req.on('data', chunk => {
    console.log("Processing Request");
    data += chunk;
  })
  req.on('end', () => {
    console.log("Data Received");
    var transactionData = JSON.parse(data);
    var transactionId = transactionData.data.relationships.transaction.data.id;   
    try{
      console.log("Transaction ID:" + transactionId);
      upAPI.getTransaction(transactionId);
    }catch(error){
      console.log(error)
    }
    res.statusCode = 200;
    res.end();
  })
})

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
})

console.log("Now Check Webhooks");

// Check to see if there are any webhooks which have already been created
upWebhookList.getWebhooks().then(webhookList => {
  // If there are no active webhooks, then create a new webhook
  if (webhookList.length == 0) {
  // This is where we get the webhook ID from the webhook, and then store it into secret manager
    upWebhookCreate.createWebhook();
  }
})
