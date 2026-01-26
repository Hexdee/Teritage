# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.18.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install Yarn (Classic)
ARG YARN_VERSION=1.22.22
RUN corepack enable && corepack prepare "yarn@${YARN_VERSION}" --activate


# Throw-away build stage to reduce size of final image
FROM base AS build

# Use development mode to install devDependencies
ENV NODE_ENV="development"

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules (handle missing lockfile)
COPY package.json yarn.lock* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else yarn install; fi

# Copy application code
COPY . .

# Build application
RUN yarn run build

# Reinstall dependencies in production mode to drop devDependencies
ENV NODE_ENV="production"
RUN rm -rf node_modules && if [ -f yarn.lock ]; then yarn install --frozen-lockfile --production=true; else yarn install --production=true; fi


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "yarn", "run", "start" ]
