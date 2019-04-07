#!/usr/bin/env bash

VERSION=$1
ARCH=$(go env GOARCH)
OS=$(go env GOOS)

echo "Building trsl8 $VERSION  os:$OS arch:$ARCH"

cd docker
docker build --tag gonzague/trsl8-build:latest --tag gonzague/trsl8-build:${VERSION} -f Dockerfile_build .
cd -

#Compressing
docker run -v "${PWD}:/go/src/github.com/lamarios/trsl8" gonzague/trsl8-build
#tar -czf trsl8-$VERSION-$OS-$ARCH.tar.gz trsl8

echo "Building the Web"

rm -Rf static/*

cd web/
npm install
npm run build
cd -

rm -Rf docker/static
rm docker/trsl8
cp trsl8 docker/trsl8
cp -R static docker/static

cd docker
docker build --tag gonzague/trsl8:latest --tag gonzague/trsl8:${VERSION} .
cd -
