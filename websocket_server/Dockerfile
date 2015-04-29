FROM ubuntu:14.04

MAINTAINER Giacomo Vacca "giacomo.vacca@gmail.com"

ENV REFRESHED_AT 2015-04-22

RUN apt-get update
RUN apt-get upgrade -y

RUN apt-get install -y nodejs

# needs this to find the nodejs exec
RUN ln -s /usr/bin/nodejs /usr/bin/node

RUN apt-get install -y npm
RUN /usr/bin/npm install ws

EXPOSE 8080

ENTRYPOINT ["/usr/bin/node", "/root/server.js"]
