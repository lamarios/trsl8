#!/usr/bin/env bash


./build.sh $1

docker push gonzague/trsl8:latest
docker push gonzauge/trsl8:$1
