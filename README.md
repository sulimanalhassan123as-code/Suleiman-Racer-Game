Islamic Google — Modern Model
============================

This is a polished, modern "Islamic Google" site (static frontend + two serverless functions).
It includes:
- Search powered by Google Custom Search (serverless function `/api/search`)
- Ask AI powered by Google Gemini (serverless function `/api/ask`)
- Clean, modern "Google-like" design with green accent

IMPORTANT: **Do not commit your real API keys to GitHub.** Use Vercel Environment Variables.

Deployment (Vercel)
-------------------
1. Create a new project in Vercel and connect the repository.
2. In Vercel dashboard -> Settings -> Environment Variables, add:

   - API_KEY  = (your Google Custom Search API key)
   - CX       = (your Custom Search Engine ID)
   - GEMINI_API_KEY = (your Gemini API key)
   - GEMINI_MODEL = gemini-2.5-pro    # or the model your key supports

   Set variables to "All" or "Production" environments as needed.

3. Deploy. Vercel will install dependencies from package.json.

Local testing (optional)
------------------------
- Copy `.env.example` to `.env` and fill in values.
- Install Vercel CLI and run `vercel dev` (requires login).
- Or run a simple local server for static files and mock the API functions separately.

Notes
-----
- The `api/` folder contains serverless functions. The frontend calls `/api/search?q=...` and `/api/ask`.
- If you change models, update `GEMINI_MODEL` in Vercel.
- Colors and layout are tuned for a modern, professional look. Feel free to adjust `css/styles.css`.

If you want, I can:
- Create a ZIP containing this project (ready to upload to GitHub).  <-- included
- Customize typography or color palette further before zipping.
