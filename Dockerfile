FROM golang:alpine as app
WORKDIR /go/src/app
RUN make webasm/
