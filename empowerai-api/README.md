# EmpowerAI API

This is a minimal serverless backend for the EmpowerAI project generator. It is intentionally separate from the static frontend so the GitHub Pages site does not expose the Gemini API key.

## Endpoint

`POST /api/generate-project`

Expected JSON body:

```json
{
  "skillLevel": "Beginner",
  "interest": "Education",
  "tools": ["Python", "APIs"],
  "timeCommitment": "1 Week",
  "extraDetails": "I like study tools"
}
```

Successful response:

```json
{
  "projectIdea": "Project Title:\n..."
}
```

## Environment Variables

Set these on the backend host, such as Vercel project settings:

- `GEMINI_API_KEY`: required Gemini API key.
- `ALLOWED_ORIGIN`: optional comma-separated frontend origins. Use your GitHub Pages origin in production, for example `https://your-user.github.io`.
- `GEMINI_MODEL`: optional Gemini model override. Defaults to `gemini-3.5-flash`.

## Deploying Separately

1. Deploy this `empowerai-api` folder as its own Vercel project.
2. Add `GEMINI_API_KEY` in the backend project's environment variables.
3. Set `ALLOWED_ORIGIN` to the GitHub Pages origin for the frontend.
4. After deployment, the frontend can call:

```txt
https://your-backend.vercel.app/api/generate-project
```

Keep the frontend backend URL as a replaceable placeholder until the deployed API URL is ready.
