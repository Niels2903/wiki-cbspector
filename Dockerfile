FROM node:latest

RUN mkdir -p /usr/src/wiki
WORKDIR /usr/src/wiki
COPY . /usr/src/wiki/
RUN "node server"
EXPOSE 3000
