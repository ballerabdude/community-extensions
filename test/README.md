# GitHub Create Pull Request Extension

This extension creates a new pull request on GitHub.

## Inputs

- `owner`: The owner of the repository (string, required)
- `repo`: The name of the repository (string, required)
- `title`: The title of the pull request (string, required)
- `head`: The name of the branch where your changes are implemented (string, required)
- `base`: The name of the branch you want the changes pulled into (string, required)
- `body`: The contents of the pull request (string, optional)

## Output

The extension returns a JSON object with the following properties:

- `pullRequestNumber`: The number of the created pull request
- `pullRequestUrl`: The URL of the created pull request
- `status`: The status of the operation ('success' or 'error')
- `message`: A message describing the result of the operation

## Environment Variables

- `GITHUB_TOKEN`: A GitHub personal access token with permissions to create pull requests

## Usage

To use this extension in your workflow, include it in your workflow configuration and provide the necessary inputs:

```yaml
name: Create Pull Request
description: Creates a new pull request on GitHub
extensionType: container
visibility: private
configuration:
  dockerImage: ghcr.io/orchestrate-ai/github-create-pull-request
  dockerTag: latest
inputs:
  owner: 
    type: string
    description: The owner of the repository
  repo:
    type: string
    description: The name of the repository
  title:
    type: string
    description: The title of the pull request
  head:
    type: string
    description: The name of the branch where your changes are implemented
  base:
    type: string
    description: The name of the branch you want the changes pulled into
  body:
    type: string
    description: The contents of the pull request
    optional: true
```

Make sure to set the `GITHUB_TOKEN` environment variable in your workflow configuration.