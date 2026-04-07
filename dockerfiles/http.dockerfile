FROM oven/bun:1

WORKDIR /usr/src/app

# copy neccessayr package.jsons and lock file
COPY /package.json /
COPY /bun.lock /
COPY /apps/http-backend/package.json /apps/http-backend
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

# run the app
EXPOSE 3001

ENTRYPOINT ["./http-entry.sh"]