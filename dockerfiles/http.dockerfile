FROM oven/bun:1

WORKDIR /usr/src/app

# copy neccessary package.jsons and lock file
COPY package.json bun.lock ./
COPY /apps/http-backend/package.json /apps/http-backend
COPY /packages/bullmq/package.json /packages/bullmq
COPY /packages/common/package.json /packages/common
COPY /packages/db/package.json /packages/db
COPY /packages/redis/package.json /packages/redis
COPY /packages/types/package.json /packages/types

# install dependencies
RUN bun install --frozen-lockfile --production

COPY . .

ENV NODE_ENV=production
ENV DOCKER_CONTAINER=true

# ensure executable inside linux
RUN chmod +x /usr/src/app/http-entry.sh

# run the app
EXPOSE 4000

# absolute path
ENTRYPOINT ["/usr/src/app/http-entry.sh"]