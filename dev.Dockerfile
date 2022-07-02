# Development environment Docker image for `aire-tech-challenge` application

FROM node:16-alpine

WORKDIR /app

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Copy package then fetch dependencies
COPY pages ./pages
COPY public ./public
COPY styles ./styles
COPY package.json package-lock.json ./
COPY next.config.js .
COPY tsconfig.json .

RUN npm ci

CMD npm run dev