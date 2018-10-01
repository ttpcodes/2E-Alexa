FROM node:8.12-alpine as build

COPY . /srv
WORKDIR /srv

RUN yarn
RUN yarn run build

FROM node:8.12-alpine
WORKDIR /srv
COPY --from=build /srv/dist ./dist
COPY --from=build /srv/package.json .
COPY --from=build /srv/yarn.lock .

RUN yarn install --production=true

CMD ["node", "dist/Main.js"]
