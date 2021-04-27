"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanup = exports.compile = void 0;
const fs_1 = require("fs");
const ts_node_1 = require("ts-node");
const Constants_1 = require("./Constants");
/** Compile .tsfuncrc in the current working directory. */
async function compile() {
    const tsFuncRc = await getTsFuncRc();
    const options = getOptions(tsFuncRc);
    const hooks = [];
    /** Queue up resolving all functions and promises to hooks. */
    for (const [key, value] of Object.entries(tsFuncRc)) {
        if (key === 'default')
            continue;
        switch (typeof value) {
            case 'function':
                hooks.push((async () => {
                    var _a;
                    return {
                        name: getName(key, options.case),
                        path: (_a = options.rootDir) !== null && _a !== void 0 ? _a : process.cwd(),
                        config: await value()
                    };
                })());
                break;
            case 'object':
                hooks.push((async () => {
                    var _a;
                    return {
                        name: getName(key, options.case),
                        path: (_a = options.rootDir) !== null && _a !== void 0 ? _a : process.cwd(),
                        config: value
                    };
                })());
        }
    }
    /** One-by-one, await each promise and handle the resolved hook. */
    for await (const hook of hooks) {
        const dir = `${hook.path}/${hook.name}`;
        if (fs_1.existsSync(dir)) {
            fs_1.rmdirSync(dir, { recursive: true });
        }
        fs_1.mkdirSync(dir, { recursive: true });
        fs_1.writeFileSync(`${dir}/function.json`, JSON.stringify(hook.config, null, 2));
    }
}
exports.compile = compile;
/** Cleanup the emitted files and directories from .tsfuncrc in the current working directory. */
async function cleanup() {
    var _a, _b;
    const tsFuncRc = await getTsFuncRc();
    const options = getOptions(tsFuncRc);
    // If not persist, delete all files.
    if (!((_a = options.persist) !== null && _a !== void 0 ? _a : false)) {
        for (const key of Object.keys(tsFuncRc)) {
            if (key === 'default')
                continue;
            const dir = `${(_b = options.rootDir) !== null && _b !== void 0 ? _b : process.cwd()}/${getName(key, options.case)}`;
            if (fs_1.existsSync(dir)) {
                fs_1.rmdirSync(dir, { recursive: true });
            }
        }
    }
}
exports.cleanup = cleanup;
function toPascalCase(name) {
    return name.split(/[-_]/gu)
        .filter(part => part.trim() !== '')
        .map(part => part.charAt(0).toUpperCase() + part.substring(1))
        .join('');
}
function toCamelCase(name) {
    const pascalCase = toPascalCase(name);
    return pascalCase.charAt(0).toLowerCase() + pascalCase.substring(1);
}
function getName(name, toCase) {
    switch (toCase) {
        case 'none':
            return name;
        case 'pascal':
            return toPascalCase(name);
        case 'camel':
        default:
            return toCamelCase(name);
    }
}
async function getTsFuncRc() {
    await ts_node_1.register();
    return await Promise.resolve().then(() => __importStar(require(`${process.cwd()}/${Constants_1.TS_FUNC_CONFIG}`)));
}
function getOptions(tsFuncRc) {
    return typeof (tsFuncRc === null || tsFuncRc === void 0 ? void 0 : tsFuncRc.default) === 'undefined' ? {} : tsFuncRc.default;
}
