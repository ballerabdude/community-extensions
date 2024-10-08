const redis = require('redis');
const dotenv = require('dotenv');

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
  const webhookPayload = inputs.webhookPayload;

  if (webhookPayload.action === 'opened') {
    const serviceName = 'GitHub';
    const description = `New issue opened: ${webhookPayload.issue.title}`;
    const action = 'CreateIssue';

    return {
      extension_spec: `${serviceName},${description},${action}`,
      issue_url: webhookPayload.issue.html_url,
      issue_number: webhookPayload.issue.number
    };
  } else {
    return {
      message: 'Not a newly opened issue. No extension_spec generated.',
      action: webhookPayload.action
    };
  }
}

main().catch(console.error);