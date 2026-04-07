FROM oven/bun:1

WORKDIR /usr/src/app

# copy neccessayr package.jsons and lock file
COPY /package.json /
COPY /bun.lock /
COPY /apps/ws-backend/package.json /apps/ws-backend
COPY /packages/bullmq/package.json /packages/bullmq
COPY /packages/common/package.json /packages/common
COPY /packages/db/package.json /packages/db
COPY /packages/redis/package.json /packages/redis
COPY /packages/types/package.json /packages/types

# install dependencies
RUN bun install --forzen-file

COPY . .

# [optional] tests & build
ENV NODE_ENV=production
# Docker
ENV DOCKER_CONTAINER=true

# ensure executable inside container
RUN chmod +x /usr/src/app/ws-entry.sh

# run the app
EXPOSE 8080

# absolute path
ENTRYPOINT ["/usr/src/app/ws-entry.sh"]