# Choose the Node.js LTS (long-term support) version
FROM node:lts-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Source
COPY server.ts ./
COPY tsconfig.json ./

ENV PORT=3101
EXPOSE $PORT

RUN if [ ! -d "/app/build" ]; then \
    npm run build; \
    fi

# Run the application
CMD ["npm", "start"]
