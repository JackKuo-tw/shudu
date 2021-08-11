FIREFOX_VERSION := $(shell cat manifest-firefox.json | grep \"version\" | cut -d '"' -f4)
CHROME_VERSION := $(shell cat manifest-chrome.json | grep \"version\" | cut -d '"' -f4)

all: shudu_firefox.zip shudu_chrome.zip
	rm manifest.json

shudu_firefox.zip:
	cp manifest-firefox.json manifest.json
	zip -r shudu_firefox-$(FIREFOX_VERSION).zip _locales  background.js  browser_ext.zip  icons  libs  manifest.json  options.html  options.js  shudu.js

shudu_chrome.zip:
	cp manifest-chrome.json manifest.json
	zip -r shudu_chrome-$(CHROME_VERSION).zip _locales  background.js  browser_ext.zip  icons  libs  manifest.json  options.html  options.js  shudu.js

clean:
	rm -f shudu_firefox-$(FIREFOX_VERSION).zip shudu_chrome-$(CHROME_VERSION).zip
