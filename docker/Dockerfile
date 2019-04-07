FROM ubuntu:18.04

RUN mkdir /app

WORKDIR /app

EXPOSE 8000

ADD trsl8 /app/trsl8
ADD static /app/static
ADD ca-certificates.crt /etc/ssl/certs/

RUN chmod +x /app/trsl8 && ls -l /app && ls -l /app/static

CMD ["/app/trsl8"]