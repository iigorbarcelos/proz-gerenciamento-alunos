ARG NODE_IMAGE=node:lts-alpine3.14

FROM --platform=linux/amd64 $NODE_IMAGE AS base
WORKDIR /app

FROM base AS dependencies
COPY ./package*.json ./
RUN yarn install
COPY . .

FROM dependencies AS build
RUN node ace build --production --ignore-ts-errors

#PRODUCAO
FROM base AS production
COPY ./package*.json ./
COPY .env .
RUN yarn install --production --ignore-ts-errors
RUN apk add --no-cache tzdata
ENV TZ=America/Sao_Paulo
COPY --from=build /app/build .

EXPOSE $PORT
CMD [ "node", "server.js" ]
