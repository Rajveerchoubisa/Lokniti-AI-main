# Deployment guide

Lokniti AI is deployed as three services because the frontend, authentication API,
and document RAG service have different runtime requirements.

## 1. Deploy the authentication API to Vercel

Import the GitHub repository into a new Vercel project and configure:

- Root Directory: `Lokniti-AI-main/backend`
- Framework Preset: Other (Vercel detects Express)
- Build Command: leave empty
- Output Directory: leave empty

Add these production environment variables:

```text
MONGO_URI=<MongoDB Atlas connection string>
JWT_SECRET=<long random value>
JWT_EXPIRES_IN=7d
EMAIL_HOST=<SMTP hostname>
EMAIL_PORT=587
EMAIL_USER=<SMTP username>
EMAIL_PASS=<SMTP password>
FROM_EMAIL=Lokniti AI <no-reply@example.com>
OTP_EXPIRY_MIN=10
FRONTEND_ORIGINS=https://<frontend-project>.vercel.app
```

After deployment, verify `https://<auth-project>.vercel.app/api/health`.

## 2. Deploy the document RAG API

The current Python API keeps uploaded documents, vector indexes, and sessions in
process memory. Deploy it on a stateful Python host rather than a serverless Vercel
Function so that `/upload` and later `/chat` requests use the same session state.

Configure the host to run from `Lokniti-AI-main` with:

```text
pip install -r requirements.txt
uvicorn api:app --host 0.0.0.0 --port $PORT
```

Set:

```text
GOOGLE_API_KEY=<Google Gemini API key>
HF_TOKEN=<Hugging Face token, if the selected model requires it>
FRONTEND_ORIGINS=https://<frontend-project>.vercel.app
```

Persistent document history across service restarts will require moving the
in-memory session data and vector indexes to persistent storage.

## 3. Deploy the frontend to Vercel

Import the same GitHub repository into a second Vercel project and configure:

- Root Directory: `Lokniti-AI-main/frontend`
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

Add:

```text
VITE_AUTH_API_URL=https://<auth-project>.vercel.app/api/auth
VITE_RAG_API_URL=https://<rag-service-domain>
```

Deploy the project. Then replace the placeholder frontend URL in both backend
services with the final Vercel production domain and redeploy them.

Do not place secrets in `VITE_*` variables: Vite embeds those values into the
public browser bundle.
