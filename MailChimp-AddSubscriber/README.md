# MailChimp-AddSubscriber Extension

This extension creates a new subscriber entry in MailChimp. It takes the subscriber's email address and other optional details as input and adds them to a specified MailChimp list.

## Requirements

- MailChimp API Key
- MailChimp List ID

## Inputs

- `apiKey` (required): Your MailChimp API key
- `listId` (required): The ID of the MailChimp list to add the subscriber to
- `email` (required): The email address of the new subscriber
- `firstName` (optional): The first name of the new subscriber
- `lastName` (optional): The last name of the new subscriber

## Output

The extension returns a JSON object with the following structure:

```json
{
  "success": true,
  "id": "subscriber_id",
  "email": "subscriber@example.com",
  "status": "subscribed"
}
```

If an error occurs, the output will have the following structure:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Usage

To use this extension in your workflow, include it in your workflow configuration and provide the necessary inputs:

```yaml
name: MailChimp-AddSubscriber
description: Add a new subscriber to MailChimp
extensionType: container
visibility: private
configuration:
  dockerImage: ghcr.io/orchestrate-ai/mailchimp-addsubscriber
  dockerTag: latest
inputs:
  apiKey: 
    type: string
    description: MailChimp API Key
  listId:
    type: string
    description: MailChimp List ID
  email:
    type: string
    description: Subscriber's email address
  firstName:
    type: string
    description: Subscriber's first name (optional)
  lastName:
    type: string
    description: Subscriber's last name (optional)
```

Ensure that you provide the required inputs (apiKey, listId, and email) when using this extension in your workflow.

## Building and Testing

To build and test this extension locally:

1. Build the Docker image:
   ```
   docker build -t mailchimp-addsubscriber .
   ```

2. Run the container with the required environment variables:
   ```
   docker run -e REDIS_HOST_URL=<redis_url> -e REDIS_USERNAME=<username> -e REDIS_PASSWORD=<password> -e REDIS_CHANNEL_IN=<channel_in> -e REDIS_CHANNEL_OUT=<channel_out> -e REDIS_CHANNEL_READY=<channel_ready> -e WORKFLOW_INSTANCE_ID=<instance_id> -e WORKFLOW_EXTENSION_ID=<extension_id> mailchimp-addsubscriber
   ```

Replace the placeholders with actual values for your Redis configuration and workflow instance.

## Support

For questions or issues related to this extension, please open an issue in the community extensions repository.