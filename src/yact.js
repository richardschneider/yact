/*
 * yact
 * https://github.com/richardschneider/yact
 *
 * Copyright (c) 2015 Richard Schneider
 * Licensed under the MIT license.
 */

'use strict';

var template = 'create trigger [trg_{table_name}]\n' +
'on {table_name} for insert, update, delete not for replication\n' +
'as\n' +
'begin\n' +
'  set NOCOUNT on\n' +
'  insert into audit (table_name, old_content, new_content)\n' +
'  select\n' +
'    \'{table_name}\',\n' +
'    case when d.{table_key} is null then null else (select d.* for xml raw) end,\n' +
'    case when i.{table_key} is null then null else (select i.* for xml raw) end\n' +
'    from inserted as i\n' +
'    full outer join deleted as d on i.{table_key} = d.{table_key}\n' +
'end\n';

module.exports.script = function(config) {
  var s = template;
  while (s.indexOf('{') >= 0)
  {
    s = s
	  .replace('{table_name}', config.table)
	  .replace('{table_key}', config.primaryKey || (config.table + '_id'));
  }
  return s;
};
