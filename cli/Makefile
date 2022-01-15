all: shudu

shudu: main.go
	go build -o shudu
cross:
	env GOOS=linux GOARCH=arm go build -o shudu_linux_arm
	env GOOS=linux GOARCH=arm64 go build -o shudu_linux_arm64
	env GOOS=linux GOARCH=amd64 go build -o shudu_linux_amd64
	env GOOS=darwin GOARCH=amd64 go build -o shudu_mac_amd64
	env GOOS=windows GOARCH=amd64 go build -o shudu_windows_amd64
clean:
	rm shudu cli
	rm shudu_linux* shudu_mac* shudu_windows*
