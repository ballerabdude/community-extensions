# Slack Extension

This extension sends a notification to a specified Slack channel or user.

## Requirements

- Slack Bot Token with chat:write scope
- Channel ID or user ID to send the message to

## Inputs

- `slackToken`: Slack Bot Token
- `channel`: Channel ID or user ID to send the message to
- `text`: The message text to send

## Usage

This extension is designed to be used within a workflow system. It receives inputs via a Redis channel, processes the message, and sends the output back through another Redis channel.

## Configuration

The extension uses the following environment variables:

- `WORKFLOW_INSTANCE_ID`
- `WORKFLOW_EXTENSION_ID`
- `REDIS_HOST_URL`
- `REDIS_USERNAME`
- `REDIS_PASSWORD`
- `REDIS_CHANNEL_IN`
- `REDIS_CHANNEL_OUT`
- `REDIS_CHANNEL_READY`

These are provided by the workflow engine when the extension is run.

## Output

The extension returns a JSON object with the following structure:

```json
{
  "success": true,
  "messageTs": "1234567890.123456",
  "channel": "C1234567890"
}
```

If an error occurs, the output will be:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Building and Deploying

1. Build the Docker image:
   ```
   docker build -t slack-extension .
   ```

2. Push the image to your Docker registry:
   ```
   docker tag slack-extension:latest your-registry/slack-extension:latest
   docker push your-registry/slack-extension:latest
   ```

3. Update your workflow configuration to use this extension, specifying the Docker image and required inputs.

## Error Handling

The extension implements error handling for missing inputs and Slack API errors. Any errors are logged and returned in the output message.

## Support

For issues or questions, please open an issue in the extension repository.