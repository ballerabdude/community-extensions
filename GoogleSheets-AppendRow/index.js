const { google } = require('googleapis');
const redis = require('redis');

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

async function appendRow(auth, spreadsheetId, range, values) {
  const sheets = google.sheets({ version: 'v4', auth });
  const resource = {
    values: [values],
  };
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource,
    });
    return response.data;
  } catch (err) {
    console.error('The API returned an error:', err);
    throw err;
  }
}

async function processMessage(message) {
  const { inputs } = JSON.parse(message);
  const { credentials, spreadsheetId, range, values } = inputs;

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(credentials),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const result = await appendRow(auth, spreadsheetId, range, values);
    return {
      success: true,
      updatedRange: result.updates.updatedRange,
      updatedRows: result.updates.updatedRows,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function main() {
  await publisher.connect();
  await subscriber.connect();

  await publisher.publish(REDIS_CHANNEL_READY, '');

  await subscriber.subscribe(REDIS_CHANNEL_IN, async (message) => {
    const result = await processMessage(message);

    const output = {
      type: result.success ? 'completed' : 'failed',
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

main().catch(console.error);