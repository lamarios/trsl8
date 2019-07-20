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
BUILD_NAME="trsl8-build"
echo "Building app"
docker stop ${BUILD_NAME}
docker rm ${BUILD_NAME}
docker run --name ${BUILD_NAME}  gonzague/trsl8-build
if [ $? -ne 0 ]; then   exit 1; fi

docker cp ${BUILD_NAME}:/go/src/github.com/lamarios/trsl8/trsl8 ./trsl8
if [ $? -ne 0 ]; then   exit 1; fi
ls -lh
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
ls -lh
docker build --no-cache --tag gonzague/trsl8:latest --tag gonzague/trsl8:${VERSION} .
if [ $? -ne 0 ]; then   exit 1; fi
cd -
