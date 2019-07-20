#!/usr/bin/env bash

VERSION=$1
#ARCH=$(go env GOARCH)
#OS=$(go env GOOS)
ARCH="amd64"
OS="linux"

echo "Building trsl8 $VERSION  os:$OS arch:$ARCH"

docker build --no-cache --tag gonzague/trsl8-build:latest --tag gonzague/trsl8-build:${VERSION} -f docker/Dockerfile_build .
if [ $? -ne 0 ]; then   exit 1; fi

#Compressing
docker run -v "${PWD}:/go/src/github.com/lamarios/trsl8" gonzague/trsl8-build
if [ $? -ne 0 ]; then   exit 1; fi
#tar -czf trsl8-$VERSION-$OS-$ARCH.tar.gz trsl8

echo "Building the Web"

rm -Rf static/*

cd web/
npm install
if [ $? -ne 0 ]; then   exit 1; fi
npm run build
if [ $? -ne 0 ]; then   exit 1; fi
cd -

rm -Rf docker/static
rm docker/trsl8
cp trsl8 docker/trsl8
cp -R static docker/static

cd docker
docker build --no-cache --tag gonzague/trsl8:latest --tag gonzague/trsl8:${VERSION} .
if [ $? -ne 0 ]; then   exit 1; fi
cd -
