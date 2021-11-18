// Defines function that initialises the webhook and creates a secret with the webhook token
async function createWebhook() {
// Access secret manager to retreive user auth token from UP
  const https = require('https');
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
  const client = new SecretManagerServiceClient();
  const [accessResponse] = await client.accessSecretVersion({
    'name': 'projects/660173564271/secrets/UP-auth-token/versions/latest',
  });

  const authToken = accessResponse.payload.data.toString('utf8');
  console.info(`Payload: ${authToken}`);

  // Create UP Webhook
  const data = new TextEncoder().encode(
      JSON.stringify({
        data: {
          attributes: {
            // URL of Cloud Run Service
            url: 'https://up-webhook-q55fhdfira-km.a.run.app',
            description: 'Webhook running on GCP'
          }
        }
      })
    )

  const options = {
    hostname: 'api.up.com.au',
    path: '/api/v1/webhooks',
    method: 'POST',
    headers: {
      'Authorization': authToken,
      'Content-Type': 'application/json',
      'Content-Length': data.length
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

  req.write(data)
  console.log("Webhook created successfully!")
  req.end()
}

module.exports = {createWebhook};