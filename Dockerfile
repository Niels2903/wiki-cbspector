FROM node:latest

RUN mkdir -p /usr/src/wiki
WORKDIR /usr/src/wiki
COPY . /usr/src/wiki/
CMD ["node", "server"]
EXPOSE 3000
