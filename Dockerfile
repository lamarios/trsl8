FROM node AS build-web
ADD ./web /src
WORKDIR /src
RUN cd src
RUN npm install
RUN npm run build

# build stage
FROM golang:alpine AS build-env
RUN apk update && apk add build-base
ADD ./ /src
RUN cd /src && go mod download && go test && go generate &&  go build -o /src/goapp

# final stage
FROM alpine
WORKDIR /app
ARG BINARY
EXPOSE 8000
COPY --from=build-env /src/goapp /app/trsl8
COPY --from=build-web /static /app/static
RUN ls /app/static
ENTRYPOINT ./trsl8