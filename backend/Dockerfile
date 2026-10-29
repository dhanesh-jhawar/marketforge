FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY shared ./shared
COPY backend/package.json ./backend/package.json
RUN npm install --workspace backend --include-workspace-root=false --omit=dev
COPY backend ./backend
COPY database ./database
WORKDIR /app/backend
EXPOSE 4000
CMD ["node", "src/server.js"]
