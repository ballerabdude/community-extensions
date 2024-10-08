const redis = require('redis');
const { Octokit } = require('@octokit/rest');

const {
  WORKFLOW_INSTANCE_ID,
  WORKFLOW_EXTENSION_ID,
  REDIS_HOST_URL,
  REDIS_USERNAME,
  REDIS_PASSWORD,
  REDIS_CHANNEL_IN,
  REDIS_CHANNEL_OUT,
  REDIS_CHANNEL_READY,
  GITHUB_TOKEN
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

const octokit = new Octokit({ auth: GITHUB_TOKEN });

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
  const { owner, repo, title, head, base, body } = inputs;

  try {
    const { data } = await octokit.pulls.create({
      owner,
      repo,
      title,
      head,
      base,
      body
    });

    return {
      pullRequestNumber: data.number,
      pullRequestUrl: data.html_url,
      status: 'success',
      message: 'Pull request created successfully'
    };
  } catch (error) {
    console.error('Error creating pull request:', error);
    return {
      status: 'error',
      message: 'Failed to create pull request',
      error: error.message
    };
  }
}

main().catch(console.error);