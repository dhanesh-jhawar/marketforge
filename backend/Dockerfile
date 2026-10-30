FROM node:22-slim
WORKDIR /app

# Install build essentials for native addons if needed
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
COPY shared ./shared
COPY backend/package.json ./backend/package.json

RUN npm install --workspace @marketforge/backend --include-workspace-root=false --omit=dev

COPY backend ./backend
COPY database ./database

WORKDIR /app/backend
EXPOSE 4000
CMD ["node", "src/server.js"]
