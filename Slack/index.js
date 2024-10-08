const redis = require('redis');
const dotenv = require('dotenv');
const { WebClient } = require('@slack/web-api');

dotenv.config();

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

async function main() {
  await publisher.connect();
  await subscriber.connect();

  await publisher.publish(REDIS_CHANNEL_READY, '');

  await subscriber.subscribe(REDIS_CHANNEL_IN, async (message) => {
    const result = await processMessage(message);

    const output = {
      type: 'completed',
      workflowInstanceId: WORKFLOW_INSTANCE_ID,
      workflowExtensionId: WORKFLOW_EXTENSION_ID,
      output: result
    };
    await publisher.publish(REDIS_CHANNEL_OUT, JSON.stringify(output));

    await subscriber.unsubscribe(REDIS_CHANNEL_IN);
    await subscriber.quit();
    await publisher.quit();
  });
}

async function processMessage(message) {
  const { inputs } = JSON.parse(message);
  
  const { slackToken, channel, text } = inputs;

  if (!slackToken || !channel || !text) {
    throw new Error('Missing required inputs: slackToken, channel, and text are required');
  }

  const slack = new WebClient(slackToken);

  try {
    const result = await slack.chat.postMessage({
      channel: channel,
      text: text,
    });

    return {
      success: true,
      messageTs: result.ts,
      channel: result.channel,
    };
  } catch (error) {
    console.error('Error sending Slack message:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});