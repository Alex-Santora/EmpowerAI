# EmpowerAI

EmpowerAI is a React + Vite website focused on free, practical AI education.  
It includes curated learning paths, mentorship pages, and an interactive AI Project Idea Generator on the Projects page.

## Structure

- `src/` frontend source
- `public/` static assets
- `empowerai-api/` separate serverless backend for the project generator

## Run locally

```bash
npm install
npm run dev
```

## Backend

The frontend is static and can be hosted on GitHub Pages.  
The project generator backend should be deployed separately on Vercel, Netlify, or another serverless platform.

Set the Gemini API key only on the backend:

`GEMINI_API_KEY`

Then replace the frontend placeholder backend URL in `src/App.jsx` with your deployed API endpoint.
