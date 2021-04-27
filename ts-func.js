#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const argparse_1 = require("argparse");
const fs_1 = require("fs");
const index_1 = require("./index");
function getVerison(pkg) {
    var _a;
    return (_a = pkg === null || pkg === void 0 ? void 0 : pkg.version) !== null && _a !== void 0 ? _a : '0.1.0';
}
function getPackage() {
    const pkgContents = fs_1.readFileSync(`${module.path}/package.json`, 'utf8');
    return JSON.parse(pkgContents);
}
async function main() {
    const parser = new argparse_1.ArgumentParser({
        description: 'TS Func: Azure function.json generator'
    });
    const command = parser.add_subparsers({
        title: 'Commands',
        metavar: '',
        dest: 'command'
    });
    command.add_parser('cleanup', {
        help: 'Clean up the current working directory of all emitted function.json.'
    });
    command.add_parser('compile', {
        help: 'Compile .tsfuncrc.(ts|js) in the current working directory and emit function.json.'
    });
    const pkg = getPackage();
    const version = getVerison(pkg);
    parser.add_argument('-v', '--version', { action: 'version', version });
    const options = parser.parse_args();
    switch (options === null || options === void 0 ? void 0 : options.command) {
        case 'cleanup':
            await index_1.cleanup();
            break;
        case 'compile':
            await index_1.compile();
            break;
        default:
            parser.parse_args(['--help']);
            break;
    }
}
main().catch(err => {
    console.error(err);
    process.exit(1);
});
