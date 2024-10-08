# GitHub-IssueToExtensionSpec Extension

This extension processes GitHub issue webhook payloads and generates an extension_spec output for newly opened issues.

## Description

When a GitHub issue webhook is received, this extension checks if it's for a newly opened issue. If so, it creates an extension_spec output following the pattern `<ServiceName,Description,Action>`.

## Requirements

- Node.js
- Redis

## Configuration

This extension requires the following environment variables:

- WORKFLOW_INSTANCE_ID
- WORKFLOW_EXTENSION_ID
- REDIS_HOST_URL
- REDIS_USERNAME
- REDIS_PASSWORD
- REDIS_CHANNEL_IN
- REDIS_CHANNEL_OUT
- REDIS_CHANNEL_READY

These are provided by the workflow engine when the extension is instantiated.

## Input

The extension expects a webhook payload from GitHub in the `inputs.webhookPayload` field of the incoming message.

## Output

For newly opened issues, the extension outputs:

```json
{
  "extension_spec": "<ServiceName,Description,Action>",
  "issue_url": "https://github.com/owner/repo/issues/number",
  "issue_number": 123
}
```

For other issue actions, it outputs:

```json
{
  "message": "Not a newly opened issue. No extension_spec generated.",
  "action": "action_type"
}
```

## Building and Running

To build the Docker image:

```bash
docker build -t github-issuetoextensionspec .
```

The extension is designed to be run as part of a workflow system. It will automatically start processing messages when instantiated with the correct environment variables.

## Testing

To test locally, you can set up a Redis instance and use the `redis-cli` to publish messages to the input channel and subscribe to the output channel.