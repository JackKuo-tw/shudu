all: shudu.wasm

shudu.wasm:
	GOARCH=wasm GOOS=js go build -gcflags=-trimpath=`go env GOPATH` -asmflags=-trimpath=`go env GOPATH` -ldflags "-w -s" -o shudu.wasm
	cp shudu.wasm ../web

clean:
	rm -f shudu.wasm
	rm -f ../web/shudu.wasm
