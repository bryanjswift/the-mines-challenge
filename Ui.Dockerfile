# Stage to buid the model interfaces
FROM node:12-alpine as builder
# The API_BASE_URL to inject into the NextJS build
ARG api_base_url
# Work from this directory to build model
WORKDIR /usr/src/
# Move to latest OS packages and add openssl and certificates
RUN apk update && apk upgrade && apk add --no-cache openssl ca-certificates
# Copy files indicating dependencies
COPY package.json yarn.lock ./
# Copy packages
COPY ui ./ui/
# Install dependencies, don't let yarn change versions
RUN yarn install --frozen-lockfile
# Inject the API_BASE_URL into the NextJS build
ENV API_BASE_URL $api_base_url
# Create the built project
RUN yarn workspace @mines/ui build

# Stage to buid the model interfaces
FROM node:12-alpine as app
# Work from this directory to build model
WORKDIR /usr/src/
# Move to latest OS packages and add openssl and certificates
RUN apk update && apk upgrade && apk add --no-cache openssl ca-certificates
# Expose port 3000, the NextJS default
EXPOSE 3000
# Set NODE_ENV for the server
ENV NODE_ENV production
# Copy dependency information from `builder`, but only the workspace specific
# `package.json`
# Copy the healthcheck script
COPY --from=builder \
  /usr/src/ui/package.json \
  /usr/src/ui/healthcheck.js \
  /usr/src/yarn.lock \
  ./
# Copy the compiled result from `builder`
COPY --from=builder /usr/src/ui/src/.next ./src/.next
# Install production dependencies, don't let yarn change versions
RUN yarn install --production --frozen-lockfile
# Create a healthcheck for the container
HEALTHCHECK --timeout=1s --interval=2s --retries=3 --start-period=3s \
  CMD node healthcheck.js
# Start the app
ENTRYPOINT ["/bin/sh", "-c", "yarn run start"]
