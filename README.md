# Shudu 舒讀

Shudu 為一個開源文字處理平台，目的是讓閱讀者能夠舒服的閱讀、輕鬆編寫文案。

[網頁版](http://shudu.jackkuo.org/) 可以將「簡體字、中國用語」轉換成「繁體、台灣習慣用語」， 並且套用舒服的文案排版格式，所有過程都不會回傳任何資料，請安心使用。

此專案特別感謝 [pangu.js](https://github.com/vinta/pangu.js)、[OpenCC](https://github.com/BYVoid/OpenCC)、[my_opencc](https://github.com/LibreService/my_opencc) 這三個專案，沒有前輩們的貢獻不會有如此好用的工具。

## Usage

```shell
$ node index.js 鼠标在手,光标跟我走!

原始: 鼠标在手,光标跟我走!
轉換: 滑鼠在手，游標跟我走！

$ node index.js "泰勒絲(Taylor Swift)在20歲時即拿到Grammy Award"

原始: 泰勒絲(Taylor Swift)在20歲時即拿到Grammy Award
轉換: 泰勒絲 (Taylor Swift) 在 20 歲時即拿到 Grammy Award
```

### go cli

```bash
$ echo 執行個體 | ./shudu --config tw2sp
实例
```

## Development & Testing

Shudu uses **Playwright** for E2E testing to ensure conversion accuracy and typography consistency.

### Run all tests (Headless)
```bash
npm run test:e2e
```

### Run tests with UI Mode
```bash
npx playwright test --ui
```

### Run a specific test file
```bash
npx playwright test tests/conversion.test.ts
```

## TODO

- [X] Firefox Addon
- [X] Chrome Extension
- [X] WebAssembly OpenCC
- [ ] Conversion Option
- [ ] Fix Some Wrong Conversions

