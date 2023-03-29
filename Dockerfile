FROM --platform=$BUILDPLATFORM node:16-alpine AS build

WORKDIR /app
COPY . .

RUN mkdir -p public/apps && mkdir -p public/imgs
RUN yarn --production --ignore-scripts \
 && yarn keystone build \
 && apk --no-cache add patch \
 && patch schema.prisma schema.prisma.patch \
 && yarn prisma generate

FROM node:16-alpine

WORKDIR /app
COPY --from=build /app /app

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