# syntax=docker/dockerfile:1.7

# --- Builder stage: install deps and build client + server ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy manifests and install all deps (including dev) for build
COPY package*.json ./
COPY *.prompt ./

RUN npm ci

# Copy the rest of the project
COPY . .

# Optional build-time variables for the client (picked by Vite config)
ARG VITE_AGENT_ID=""
ENV VITE_AGENT_ID=${VITE_AGENT_ID}

ARG VITE_NVM_ENVIRONMENT
ENV VITE_NVM_ENVIRONMENT=${VITE_NVM_ENVIRONMENT}

# Build: Vite creates dist/public and esbuild bundles server to dist/index.js
RUN npm run build

# --- Runtime stage: run the production server ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only what we need to run
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/agent.prompt ./agent.prompt
COPY --from=builder /app/llm-router.prompt ./llm-router.prompt

# Remove dev dependencies from runtime image
RUN npm prune --omit=dev

# The app listens on 3000
EXPOSE 3000

# Healthcheck using Node's http module (no extra packages needed)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "require('http').request({host:'127.0.0.1',port:3000,path:'/'},r=>process.exit(r.statusCode>=200&&r.statusCode<500?0:1)).on('error',()=>process.exit(1)).end()"

# Run the server
CMD ["node", "dist/index.js"]
