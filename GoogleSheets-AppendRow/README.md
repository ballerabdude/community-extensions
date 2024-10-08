# GoogleSheets-AppendRow Extension

This extension appends a new row of data to a specified Google Sheet using the Google Sheets API.

## Requirements

- Google Cloud project with Sheets API enabled
- Service account credentials with access to the target Google Sheet

## Inputs

The extension expects the following inputs:

- `credentials`: A JSON string containing the service account credentials
- `spreadsheetId`: The ID of the target Google Sheet
- `range`: The range where the new row should be appended (e.g., "Sheet1!A:Z")
- `values`: An array of values to be appended as a new row

## Output

The extension returns a JSON object with the following properties:

- `success`: A boolean indicating whether the operation was successful
- `updatedRange`: The range that was updated (if successful)
- `updatedRows`: The number of rows that were updated (if successful)
- `error`: An error message (if the operation failed)

## Usage

To use this extension in your workflow, configure it with the appropriate Docker image and provide the required inputs.

Example configuration:

```yaml
name: GoogleSheets-AppendRow
description: Appends a new row of data to a specified Google Sheet
extensionType: container
visibility: private
configuration:
  dockerImage: your-registry.com/googlesheets-appendrow
  dockerTag: latest
inputs:
  credentials:
    type: string
    description: Service account credentials JSON
  spreadsheetId:
    type: string
    description: ID of the target Google Sheet
  range:
    type: string
    description: Range where the new row should be appended
  values:
    type: array
    description: Array of values to be appended as a new row
```

Ensure that the service account credentials are securely stored and provided to the extension as an input.