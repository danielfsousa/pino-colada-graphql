#! /usr/bin/env node
const split = require('split2')
const pinoColadaGraphql = require('./')()
const input = process.stdin
const output = process.stdout

input
  .pipe(split(pinoColadaGraphql))
  .pipe(output)
