// Script to delete an existing webhook with webhookID
const https = require('https');
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

async function deleteWebhook(webhookId) {
  // Retrieve authentication token from secret manager
  // Access secret manager to retreive user auth token from UP
  const [accessResponse] = await client.accessSecretVersion({
    'name': 'projects/660173564271/secrets/UP-auth-token/versions/latest',
  });
  const authToken = accessResponse.payload.data.toString('utf8');
  const options = {
    hostname: 'api.up.com.au',
    path: '/api/v1/webhooks/'+webhookId,
    method: 'DELETE',
    headers: {
      'Authorization': authToken,
    }
  }

  const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
      process.stdout.write(d)
    })
  })

  req.on('error', error => {
    console.error(error)
  })

  req.end()
}

module.exports = {deleteWebhook};