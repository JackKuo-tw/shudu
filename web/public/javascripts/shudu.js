// Shudu Web Core
// This handles OpenCC WASM initialization and provides conversion functions

var wasmReadyResolve;
var wasmReadyReject;
var wasmReadyPromise = new Promise((resolve, reject) => {
    wasmReadyResolve = resolve;
    wasmReadyReject = reject;
});

var isWasmReady = false;

// Module configuration for OpenCC WASM
// This must be defined before opencc.js runs
var Module = {
    locateFile: function (path, prefix) {
        if (path.endsWith('.wasm')) {
            return 'public/libs/opencc/' + path;
        }
        return prefix + path;
    },
    onRuntimeInitialized: async function () {
        try {
            await loadDependencies();
            isWasmReady = true;
            wasmReadyResolve();
            console.log("Shudu WASM ready");
        } catch (e) {
            console.error("[Shudu] Failed to load dependencies:", e);
            wasmReadyReject(e);
        }
    },
    onAbort: function (what) {
        console.error("[Shudu] WASM aborted:", what);
        wasmReadyReject(new Error("WASM aborted: " + what));
    },
    print: function (text) { console.log('[Shudu]', text); },
    printErr: function (text) { console.error('[Shudu]', text); }
};

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

async function loadDependencies() {
    for (const file of dependencies) {
        const url = 'public/libs/opencc/' + file;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
            const data = await response.arrayBuffer();
            Module.FS.writeFile(file, new Uint8Array(data));
        } catch (e) {
            console.error(`[Shudu] Failed to load ${file}:`, e);
            throw e;
        }
    }
}

async function convertText(text, conf = 's2twp.json') {
    if (!isWasmReady) {
        await wasmReadyPromise;
    }

    const isArray = Array.isArray(text);
    const inputs = isArray ? text : [text];
    const results = [];

    const inputFile = 'input.txt';
    const outputFile = 'output.txt';

    for (const inputStr of inputs) {
        try {
            Module.FS.writeFile(inputFile, inputStr);
            const args = ['-i', inputFile, '-o', outputFile, '-c', conf];

            if (!Module.callMain) {
                throw new Error("Module.callMain is not available.");
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
        } finally {
            try {
                if (Module.FS.analyzePath(inputFile).exists) Module.FS.unlink(inputFile);
                if (Module.FS.analyzePath(outputFile).exists) Module.FS.unlink(outputFile);
            } catch (e) { }
        }
    }

    return isArray ? results : results[0];
}

window.shudu = {
    convertText,
    ready: wasmReadyPromise
};
