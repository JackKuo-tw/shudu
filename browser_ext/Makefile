FIREFOX_VERSION := $(shell cat manifest-firefox.json | grep \"version\" | cut -d '"' -f4)
CHROME_VERSION := $(shell cat manifest-chrome.json | grep \"version\" | cut -d '"' -f4)

#all: shudu_firefox.zip shudu_chrome.zip
all: shudu_chrome.zip

shudu_firefox.zip:
	cp manifest-firefox.json manifest.json
	zip -r shudu_firefox-$(FIREFOX_VERSION).zip _locales  background.js  browser_ext.zip  icons  libs  manifest.json  options.html  options.js  shudu.js release_notes.html shudu_intro.gif

shudu_chrome.zip:
	cp manifest-chrome.json manifest.json
	zip -r shudu_chrome-$(CHROME_VERSION).zip _locales  background.js  browser_ext.zip  icons  libs  manifest.json  options.html  options.js  shudu.js release_notes.html shudu_intro.gif

clean:
	rm -f shudu_firefox-$(FIREFOX_VERSION).zip shudu_chrome-$(CHROME_VERSION).zip
