# Development environment Docker image

FROM node:16-alpine

WORKDIR /app

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Copy package then fetch dependencies
# NOTE: Project files are expected to be mounted into the container
COPY package.json package-lock.json ./

RUN npm ci

CMD npm run dev