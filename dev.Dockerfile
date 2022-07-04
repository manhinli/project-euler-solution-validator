# Development environment Docker image

# Force x86-64 image for image as test tooling uses binaries which are otherwise
# not available for aarch64
FROM --platform=linux/amd64 node:16

WORKDIR /app

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Copy package then fetch dependencies
# NOTE: Project files are expected to be mounted into the container
COPY package.json package-lock.json ./

RUN npm ci

CMD npm run dev