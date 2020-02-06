#!/usr/bin/env bash

VERSION=$1
#ARCH=$(go env GOARCH)
#OS=$(go env GOOS)
ARCH="amd64"
OS="linux"

docker build --no-cache --tag gonzague/trsl8:latest --tag gonzague/trsl8:${VERSION} .
if [ $? -ne 0 ]; then   exit 1; fi
