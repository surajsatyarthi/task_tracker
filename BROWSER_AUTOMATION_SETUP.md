# Browser Automation Setup with Playwright MCP

## What This Solves
This enables AI assistants to:
- Open and interact with web pages (like Vercel dashboard)
- View deployment logs and error messages
- Capture screenshots of deployment status
- Debug deployment issues by viewing the actual browser interface

## Installation Steps

### 1. Add Playwright MCP to Claude Desktop

Edit your Claude Desktop configuration file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add this to the `mcpServers` section:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest"
      ]
    }
  }
}
```

If you already have other MCP servers configured, just add the playwright entry to the existing `mcpServers` object.

### 2. Restart Claude Desktop

After saving the configuration file, fully quit and restart Claude Desktop for the changes to take effect.

### 3. Test the Setup

Once restarted, you can ask Claude to:
- "Navigate to https://vercel.com and show me the screenshot"
- "Open the Vercel dashboard and check the latest deployment status"
- "Go to https://vercel.com/suraj-satyarthis-projects/task-tracker/deployments and screenshot the error logs"

## Features You'll Get

### Core Automation
- **navigate** - Navigate to any URL
- **click** - Click elements on the page
- **fill** - Fill out forms
- **screenshot** - Capture page screenshots
- **evaluate** - Run JavaScript on the page
- **expect** - Make test assertions

### Advanced Options
You can customize with additional flags:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--headless",              // Run without visible browser window
        "--save-trace",            // Save traces for debugging
        "--timeout-action=10000"   // 10 second timeout for actions
      ]
    }
  }
}
```

## Configuration for Vercel Dashboard Access

Since you need to access Vercel's authenticated dashboard, you have two options:

### Option A: Use Your Browser Session (Recommended)

Install the Playwright MCP Chrome Extension to use your existing logged-in Vercel session:

1. Install the extension from: https://github.com/microsoft/playwright-mcp/tree/main/extension
2. Configure Claude Desktop:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--extension"
      ]
    }
  }
}
```

### Option B: Save Vercel Login State

1. First, manually log in to Vercel in a headed browser:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--save-session"
      ]
    }
  }
}
```

2. Ask Claude to navigate to Vercel and log in
3. The session will be saved for future use

## Example Usage After Setup

```
You: "Navigate to https://vercel.com/suraj-satyarthis-projects/task-tracker/deployments and show me the latest failed deployment logs"

Claude will:
1. Open Playwright browser
2. Navigate to the URL
3. Take a screenshot of the page
4. Extract the visible error logs
5. Return the information to you
```

## Troubleshooting

### "Command not found: npx"
- Make sure Node.js is installed: `node --version`
- Install Node.js from https://nodejs.org/ if needed

### "MCP server not showing up in Claude"
- Verify the JSON syntax is correct (use https://jsonlint.com/)
- Fully quit and restart Claude Desktop
- Check Claude Desktop logs for errors

### "Browser automation not working"
- First run will download Playwright browsers automatically
- This may take a few minutes
- Check your internet connection

## Alternative: Browserbase MCP (Cloud-based)

If you prefer a cloud-based solution that doesn't require local browser installation:

```json
{
  "mcpServers": {
    "browserbase": {
      "command": "npx",
      "args": [
        "-y",
        "@browserbasehq/mcp-server-browserbase"
      ],
      "env": {
        "BROWSERBASE_API_KEY": "your_api_key_here",
        "BROWSERBASE_PROJECT_ID": "your_project_id_here"
      }
    }
  }
}
```

Get API keys from: https://www.browserbase.com/

## Next Steps

After setup:
1. Ask Claude to navigate to your Vercel deployment page
2. Get the actual build error from the deployment logs
3. We can then fix the underlying issue causing build failures
