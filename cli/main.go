package main

import (
	"bufio"
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/liuzl/goutil"
	"github.com/longbridgeapp/opencc"
	"github.com/vinta/pangu"
)

var (
	config = flag.String("config", "", "conversion config: s2twp, tw2sp")
)

func main() {
	flag.Parse()
	if *config == "" {
		*config = "s2twp"
	}
	s2t, err := opencc.New(*config)
	if err != nil {
		log.Fatal(err)
	}

	var in = os.Stdin
	var out = os.Stdout

	br := bufio.NewReader(in)
	err = goutil.ForEachLine(br, func(line string) error {
		str, e := s2t.Convert(line)
		if e != nil {
			return e
		}
		str = pangu.SpacingText(str)
		fmt.Fprint(out, str+"\n")
		return nil
	})

}
