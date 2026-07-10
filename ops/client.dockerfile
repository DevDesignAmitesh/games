FROM oven/bun:1

WORKDIR /usr/src/app

# copy neccessayr package.jsons and lock file
COPY package.json bun.lock /
COPY /apps/client/package.json /apps/client
COPY /packages/bullmq/package.json /packages/bullmq
COPY /packages/common/package.json /packages/common
COPY /packages/db/package.json /packages/db
COPY /packages/redis/package.json /packages/redis
COPY /packages/types/package.json /packages/types

# install dependencies
RUN bun install

COPY . .

# [optional] tests & build
ENV NEXT_PUBLIC_NODE_ENV=production
# Docker
ENV NEXT_PUBLIC_DOCKER_CONTAINER=true

RUN bun run build:client

# run the app
EXPOSE 3000

CMD [ "bun", "run", "client:fe" ]