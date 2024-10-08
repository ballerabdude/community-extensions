const axios = require('axios');
const crypto = require('crypto');

const {
  WORKFLOW_INSTANCE_ID,
  WORKFLOW_EXTENSION_ID,
  REDIS_HOST_URL,
  REDIS_USERNAME,
  REDIS_PASSWORD,
  REDIS_CHANNEL_IN,
  REDIS_CHANNEL_OUT,
  REDIS_CHANNEL_READY
} = process.env;

const redis = require('redis');

const publisher = redis.createClient({
  url: REDIS_HOST_URL,
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
});

const subscriber = redis.createClient({
  url: REDIS_HOST_URL,
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
});

async function addSubscriber(apiKey, listId, subscriberData) {
  const dc = apiKey.split('-')[1];
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`;

  const subscriberHash = crypto.createHash('md5').update(subscriberData.email_address.toLowerCase()).digest('hex');

  try {
    const response = await axios.put(url, subscriberData, {
      headers: {
        'Authorization': `apikey ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      id: response.data.id,
      email: response.data.email_address,
      status: response.data.status
    };
  } catch (error) {
    console.error('Error adding subscriber:', error.response ? error.response.data : error.message);
    return {
      success: false,
      error: error.response ? error.response.data : error.message
    };
  }
}

async function processMessage(message) {
  const { inputs } = JSON.parse(message);
  
  const { apiKey, listId, email, firstName, lastName } = inputs;

  if (!apiKey || !listId || !email) {
    throw new Error('Missing required inputs: apiKey, listId, and email are required');
  }

  const subscriberData = {
    email_address: email,
    status: 'subscribed',
    merge_fields: {}
  };

  if (firstName) subscriberData.merge_fields.FNAME = firstName;
  if (lastName) subscriberData.merge_fields.LNAME = lastName;

  const result = await addSubscriber(apiKey, listId, subscriberData);

  return result;
}

async function main() {
  await publisher.connect();
  await subscriber.connect();

  await publisher.publish(REDIS_CHANNEL_READY, '');

  await subscriber.subscribe(REDIS_CHANNEL_IN, async (message) => {
    try {
      const result = await processMessage(message);

      const output = {
        type: 'completed',
        workflowInstanceId: WORKFLOW_INSTANCE_ID,
        workflowExtensionId: WORKFLOW_EXTENSION_ID,
        output: result
      };
      await publisher.publish(REDIS_CHANNEL_OUT, JSON.stringify(output));
    } catch (error) {
      const errorOutput = {
        type: 'failed',
        workflowInstanceId: WORKFLOW_INSTANCE_ID,
        workflowExtensionId: WORKFLOW_EXTENSION_ID,
        error: error.message
      };
      await publisher.publish(REDIS_CHANNEL_OUT, JSON.stringify(errorOutput));
    } finally {
      await subscriber.unsubscribe(REDIS_CHANNEL_IN);
      await subscriber.quit();
      await publisher.quit();
    }
  });
}

main().catch(console.error);