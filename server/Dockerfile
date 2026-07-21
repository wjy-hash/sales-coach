FROM node:20-alpine

WORKDIR /app

# Copy bundled server
COPY dist/ ./dist/

# Copy frontend static files
COPY ../client/dist/ ./public/

ENV PORT=3001
ENV STATIC_DIR=/app/public

EXPOSE 3001

CMD ["node", "dist/index.js"]
