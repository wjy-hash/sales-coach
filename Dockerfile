# Multi-stage build for Sales Coach app
# Stage 1: Build frontend
FROM node:20-alpine AS frontend
WORKDIR /app/client
COPY client/package.json client/package-lock.json* ./
RUN npm install
COPY client/ ./
RUN npx vite build

# Stage 2: Bundle server
FROM node:20-alpine AS server-bundle
WORKDIR /app/server
COPY server/package.json server/package-lock.json* ./
RUN npm install
COPY server/ ./
RUN node bundle.js

# Stage 3: Production image
FROM node:20-alpine
WORKDIR /app

# Copy server bundle
COPY --from=server-bundle /app/server/dist/ ./dist/
# Copy built frontend
COPY --from=frontend /app/client/dist/ ./public/

ENV PORT=3001
ENV STATIC_DIR=/app/public
ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/index.js"]
