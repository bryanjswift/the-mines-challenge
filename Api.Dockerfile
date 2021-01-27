# Stage to buid the model interfaces
FROM node:12-alpine as builder
# Work from this directory to build model
WORKDIR /usr/src/
# Move to latest OS packages and add openssl and certificates
RUN apk add --no-cache openssl ca-certificates
# Copy `yarn` serup
COPY .yarn/ ./.yarn/
# Copy files indicating dependencies
COPY package.json yarn.lock tsconfig.base.json .yarnrc.yml ./
# Copy packages
COPY server-nest ./server-nest/
# Install dependencies, don't let yarn change versions
RUN yarn install
# Create the built project
RUN yarn workspace @mines/nest build

# Stage to buid the model interfaces
FROM node:12-alpine as app
# Work from this directory to build model
WORKDIR /usr/src/
# Move to latest OS packages and add openssl and certificates
RUN apk add --no-cache openssl ca-certificates
# Set NODE_ENV for the server
ENV NODE_ENV production
# Tell server to use port 3000
ENV PORT 3000
# Expose port 3000
EXPOSE 3000
# Copy yarn setup from `builder`
COPY --from=builder \
  /usr/src/.yarn/ \
  ./.yarn/
# Copy dependency information from `builder`, but only the workspace specific
# `package.json`
COPY --from=builder \
  /usr/src/server-nest/package.json \
  /usr/src/yarn.lock \
  /usr/src/.yarnrc.yml \
  ./
# Copy the compiled result from `builder`
COPY --from=builder \
  /usr/src/server-nest/dist \
  ./src
# Install production dependencies, don't let yarn change versions
RUN yarn install
# Create a healthcheck for the container
HEALTHCHECK --timeout=500ms --interval=2s --retries=3 --start-period=3s \
  CMD printf "GET /ping\r\n\r\n" | nc 127.0.0.1 3000 | grep -e '^PONG$'
# Start the app
ENTRYPOINT ["/bin/sh", "-c", "node ./src/main.js"]
