# Development environment Docker image for `aire-tech-challenge` application

FROM node:16-alpine

WORKDIR /app

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Copy package then fetch dependencies
# NOTE: Project files are expected to be mounted into the container
COPY package.json package-lock.json ./
COPY next.config.js .
COPY tsconfig.json .

RUN npm ci

CMD npm run dev