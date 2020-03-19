#!/usr/bin/env node

const [,, ...args] = process.argv

let gitgat;

try {
    gitgat = require(`${process.cwd()}/node_modules/gitgat/index.js`);
} catch (e) {
    gitgat = require('./index');
}

gitgat(args)