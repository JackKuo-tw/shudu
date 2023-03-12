package main

import (
    "log"
    "fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
    "fyne.io/fyne/v2/dialog"
    "os"
    "fmt"
    "github.com/flopp/go-findfont"
   	"github.com/golang/freetype/truetype"

	"github.com/longbridgeapp/opencc"
	"github.com/vinta/pangu"
)

func init() {
   targetFont := "Arial Unicode.ttf"
   fontPath, err := findfont.Find(targetFont)
   if err != nil {
      panic(err)
   }
   fmt.Printf("Found '%s' in '%s'\n", targetFont, fontPath)

   fontData, err := os.ReadFile(fontPath)
   if err != nil {
      log.Fatal(err)
      panic(err)
   }
   _, err = truetype.Parse(fontData)
   if err != nil {
      log.Fatal(err)
      panic(err)
   }
   os.Setenv("FYNE_FONT", fontPath)
}

func convert(str string, config string) (string, error){
	s2t, err := opencc.New(config)
	if err != nil {
		log.Fatal(err)
        return "", err
	}

    str, err2 := s2t.Convert(str)
    if err2 != nil {
        log.Fatal(err2)
        return "", err2
    }
    str = pangu.SpacingText(str)
    log.Println("converted result: ", str)
    return str, nil
}

func main() {
	shuduApp := app.New()
	mainWindow := shuduApp.NewWindow("Shudu 舒讀")
    mainWindow.Resize(fyne.NewSize(800, 600));
    mainWindow.CenterOnScreen()

    inputEntry := widget.NewMultiLineEntry()
	inputEntry.SetPlaceHolder("請輸入欲轉換文字...")
    inputEntry.SetMinRowsVisible(20)

    s2twpStr := "繁體台灣用語"
    tw2spStr := "簡體中國用語"
    currentConfig := s2twpStr

    configRadioGroup := widget.NewRadioGroup([]string{s2twpStr, tw2spStr}, func(value string) {
		log.Println("Config set to: ", value)
        if value == s2twpStr {
            currentConfig = "s2twp"
        } else {
            currentConfig = "tw2sp"
        }
	})
    configRadioGroup.SetSelected(s2twpStr)

	content := container.NewVBox(inputEntry, configRadioGroup, widget.NewButton("轉換", func() {
		log.Println("input text: ", inputEntry.Text)
        convertedStr, err := convert(inputEntry.Text, currentConfig)
        if err != nil {
            dialog.ShowError(err, mainWindow)
        } else {
            inputEntry.SetText(convertedStr)
        }
	}))

	mainWindow.SetContent(content)
	mainWindow.ShowAndRun()
}
