# Choose the Node.js LTS (long-term support) version
FROM node:lts-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Source
COPY pages ./pages
COPY public ./public
COPY styles ./styles
COPY src/components ./src/components
COPY src/models ./src/models
COPY src/schema ./src/schema
COPY src/service ./src/service
COPY src/utils ./src/utils


# config
COPY next-env.d.ts ./
COPY next.config.mjs ./
COPY tailwind.config.ts ./
COPY tsconfig.json ./
COPY postcss.config.js ./

EXPOSE $PORT

RUN if [ ! -d "/app/.next" ]; then \
    npm run build; \
    fi

# Run the application
CMD ["npm", "start"]
