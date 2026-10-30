FROM node:20-slim AS builder
WORKDIR /app

# Copy root workspace config and shared packages
COPY package.json package-lock.json* ./
COPY shared ./shared
COPY frontend/package.json ./frontend/package.json

# Install dependencies
RUN npm install --workspace @marketforge/frontend --include-workspace-root

# Copy frontend source code
COPY frontend ./frontend

# Build Next.js application
WORKDIR /app/frontend
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:4000/api}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL:-ws://localhost:4000/ws}

RUN npm run build

# Production Runner
FROM node:20-slim AS runner
WORKDIR /app/frontend
ENV NODE_ENV=production

COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/shared /app/shared
COPY --from=builder /app/frontend /app/frontend

EXPOSE 3000
CMD ["npm", "run", "start"]
