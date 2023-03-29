FROM node:16-alpine

WORKDIR /app
COPY . .

RUN mkdir -p public/apps && mkdir -p public/imgs
RUN yarn && yarn keystone build

ARG https_proxy=http://172.19.224.1:17890
ARG http_proxy=http://172.19.224.1:17890

EXPOSE 3000

VOLUME [ "/app/public" ]

ENV DB_HOST=postgres
ENV DB_PORT=5432
ENV DB_USERNAME=postgres
ENV DB_PASSWORD=postgres
ENV DB_DATABASE=deepal-store
ENV ASSET_BASE_URL=https://tsp.changan.x-tetris.com
ENV EXTERNAL_IP=127.0.0.1

CMD ["yarn", "keystone", "start", "--with-migrations"]