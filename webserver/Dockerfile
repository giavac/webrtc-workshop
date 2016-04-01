FROM ubuntu:14.04

MAINTAINER Giacomo Vacca "giacomo.vacca@gmail.com"

ENV REFRESHED_AT 2015-04-22

RUN apt-get update
RUN apt-get -y -q install nginx

RUN mkdir -p /var/www/html
ADD nginx/global.conf /etc/nginx/conf.d/
ADD nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/ssl.key /root
COPY nginx/ssl.crt /root

EXPOSE 8000
