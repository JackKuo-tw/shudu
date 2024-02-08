package main

import (
	"flag"
	"fmt"
	"strings"
	"syscall/js"

	"github.com/longbridgeapp/opencc"
	"github.com/vinta/pangu"
)

var (
	config = flag.String("config", "", "conversion config: s2twp, tw2sp")
)

func main() {
	flag.Parse()

	c := make(chan struct{}, 0)

	js.Global().Set("convertText", js.FuncOf(convertText))

	<-c
}

// because pangu's go lib doesn't have such feature, but JavaScript version does
func replaceHalfWidthToFullWidth(input string) string {
	replacements := map[string]string{
		"!": "！",
		",": "，",
		":": "：",
		"?": "？",
		"~": "～",
	}

	var result strings.Builder
	for _, char := range input {
		if replacement, ok := replacements[string(char)]; ok {
			result.WriteString(replacement)
		} else {
			result.WriteRune(char)
		}
	}

	return result.String()
}

func convertText(this js.Value, p []js.Value) interface{} {
	if len(p) < 3 {
		fmt.Println("Error: not enough parameters")
		return nil
	}

	textArray := p[0]
	config := p[1].String()
	applyPangu := p[2].Bool()

	// Convert JavaScript array to Go slice of strings
	var texts []string
	for i := 0; i < textArray.Length(); i++ {
		texts = append(texts, textArray.Index(i).String())
	}

	s2t, err := opencc.New(config)
	if err != nil {
		fmt.Println("Error initializing opencc:", err)
		return nil
	}

	// Convert each text in the array
	var convertedTexts []string
	for _, text := range texts {
		str, err := s2t.Convert(text)
		if err != nil {
			fmt.Println("Error converting text:", err)
			return nil
		}

		if applyPangu {
			str = replaceHalfWidthToFullWidth(str)
			str = pangu.SpacingText(str)
		}
		convertedTexts = append(convertedTexts, str)
	}

	// Convert the result to a JavaScript array
	jsResult := js.Global().Get("Array").New(len(convertedTexts))
	for i, str := range convertedTexts {
		jsResult.SetIndex(i, js.ValueOf(str))
	}

	return jsResult
}
