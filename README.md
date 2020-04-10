# Shudu 舒讀

Shudu 為一個開源文字處理平台，目的是讓閱讀者能夠舒適的閱讀、編寫文案。

此專案特別感謝 [pangu.js](https://github.com/vinta/pangu.js)、[OpenCC](https://github.com/BYVoid/OpenCC) 這兩個專案，沒有前輩們的貢獻不會有如此好用的工具。

## Installation

`$ npm install`

## Usage

```shell
$ node index.js 鼠标在手,光标跟我走!

原始: 鼠标在手,光标跟我走!
轉換: 滑鼠在手，游標跟我走！

$ node index.js "泰勒絲(Taylor Swift)在20歲時即拿到Grammy Award"

原始: 泰勒絲(Taylor Swift)在20歲時即拿到Grammy Award
轉換: 泰勒絲 (Taylor Swift) 在 20 歲時即拿到 Grammy Award
```


## TODO

- [x] Web GUI server
- [ ] JSON server
- [ ] Browser Plugins
