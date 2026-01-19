const fs = require('fs');
const path = require('path');
const pangu = require('./pangu');

// Emulate Emscripten environment setup
// We set global.Module SO THAT require('./opencc.js') uses it.
// We enable noInitialRun to prevent autoexecution of main with process.argv
const Module = {
    noInitialRun: true,
    onRuntimeInitialized: onWasmReady,
    print: (text) => console.log(text),
    printErr: (text) => console.error(text),
    // emulate locateFile for Node if needed, though __dirname usually works in default node-emscripten
};
global.Module = Module;

// Require opencc.js (modifies Module and attaches FS to Module)
require('./opencc.js');

let isReady = false;
let initPromiseResolve;
const initPromise = new Promise(resolve => initPromiseResolve = resolve);

const dependencies = [
    'STCharacters.ocd2',
    'STPhrases.ocd2',
    'TSCharacters.ocd2',
    'TSPhrases.ocd2',
    'TWPhrases.ocd2',
    'TWPhrasesRev.ocd2',
    'TWVariants.ocd2',
    'TWVariantsRev.ocd2',
    'TWVariantsRevPhrases.ocd2',
    's2twp.json',
    'tw2sp.json'
];

async function onWasmReady() {
    // WASM is compiled and ready.
    // Now load config files into MEMFS
    try {
        for (const file of dependencies) {
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath);
                Module.FS.writeFile(file, data);
            } else {
                console.warn(`Warning: Dependency file ${file} not found in ${__dirname}`);
            }
        }
        isReady = true;
        initPromiseResolve();
    } catch (e) {
        console.error("Failed to load dependencies:", e);
    }
}

async function convertText(text, conf = 's2twp.json') {
    if (!isReady) await initPromise;

    // Support array of strings
    const isArray = Array.isArray(text);
    const inputs = isArray ? text : [text];
    const results = [];

    // Use a temporary input/output file interaction
    // To handle concurrency properly in a single WASM instance (which uses global state usually),
    // strictly speaking we should queue. But for this script likely one call.
    // However, let's process sequentially.

    // Using a shared I/O file name might cause race conditions if called in parallel?
    // Since node is single threaded event loop, calling `callMain` (sync) is safe sequentially.
    // But `callMain` is SYNC.

    const inputFile = 'input.txt';
    const outputFile = 'output.txt';

    for (const inputStr of inputs) {
        try {
            Module.FS.writeFile(inputFile, inputStr);
            const args = ['-i', inputFile, '-o', outputFile, '-c', conf];

            // callMain comes from our patch in opencc.js
            if (!Module.callMain) {
                throw new Error("Module.callMain is not available. Ensure opencc.js is patched.");
            }

            const status = Module.callMain(args);
            if (status !== 0) {
                throw new Error(`Conversion failed with status ${status}`);
            }

            if (Module.FS.analyzePath(outputFile).exists) {
                const outputContent = Module.FS.readFile(outputFile, { encoding: 'utf8' });
                results.push(outputContent);
            } else {
                throw new Error("Output file missing");
            }
        } catch (e) {
            console.error("Conversion error:", e);
            results.push(inputStr); // Fallback to original
        }
    }

    return isArray ? results : results[0];
}

module.exports = {
    getArgText() {
        const args = process.argv;
        if (args.length < 3) {
            console.log('\nUsage: node index.js 需要轉換的字串');
            process.exit();
        }

        return args[2];
    },

    async punctuate(origin, category = 'fullWidth') {
        let converted;
        if (category === 'fullWidth') {
            if (Array.isArray(origin)) {
                converted = origin.map(s => pangu.spacing(s))
            } else {
                converted = pangu.spacing(origin);
            }
        } else {
            converted = origin; // default or halfWidth (not implemented)
        }
        return converted;
    },

    convertText
};

// If run directly
if (require.main === module) {
    (async () => {
        const text = module.exports.getArgText();
        try {
            const converted = await convertText(text);
            const punctuated = await module.exports.punctuate(converted);
            console.log(punctuated);
        } catch (e) {
            console.error(e);
        }
    })();
}
