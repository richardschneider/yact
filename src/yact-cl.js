#! /usr/bin/env node
/*
 * yact-cl
 * https://github.com/richardschneider/yact
 *
 * Copyright (c) 2015 Richard Schneider
 * Licensed under the MIT license.
 */

'use strict';

var program = require('commander');
var fs = require('fs');
var yact = require('./yact');

program
  .version('0.1.0')
  .usage('[options] [table...]')
  .description('Generate the audit trigger script for the table(s)')
  .option('-a, --audit', 'include the script to create the Audit table')
// TODO:  .option('-g, --go', 'apply script(s) to the database')
  .option('-i, --individual', 'save the script(s) as individual files.')
  .option('-o, --output [file]', 'save the script(s) to the specified file, the default is "yact.sql"')
  ;

program.parse(process.argv);

var scriptName = program.output || 'yact.sql';
if (!program.individual) {
  fs.writeFileSync(scriptName, '');
  console.log('created ' + scriptName);
}

function save(script, table) {
  if (program.individual) {
    fs.writeFileSync(table + '.sql', script);
	console.log('created ' + table + '.sql');
  } else {
    fs.appendFileSync(scriptName, script + 'GO\n\n');
  }
}

if (program.audit) {
   save(yact.auditScript(), 'audit');
}

if (program.args) {
  program.args.forEach(function(table) {
   save(yact.script({table: table}), table);
  });
}
