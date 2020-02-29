# Stage to buid the model interfaces
FROM node:12-alpine as builder
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
# Create the built project
RUN yarn workspace @mines/ui build

# Stage to buid the model interfaces
FROM node:12-alpine as app
# Work from this directory to build model
WORKDIR /usr/src/
# Move to latest OS packages and add openssl and certificates
RUN apk update && apk upgrade && apk add --no-cache openssl ca-certificates
# Expose port 80
EXPOSE 3000
# Set NODE_ENV for the server
ENV NODE_ENV production
# Copy dependency information from builder
COPY --from=builder /usr/src/ui/package.json /usr/src/yarn.lock ./
# Copy the built static files to the html folder
COPY --from=builder /usr/src/ui/src/.next ./src/.next
# Install dependencies, don't let yarn change versions
RUN yarn install --production --frozen-lockfile
# Start the app
ENTRYPOINT ["/bin/sh", "-c", "yarn run start"]
