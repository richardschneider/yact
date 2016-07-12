# yact

Yet another change tracker for SQL tables.  Most software systems require a `Change Tracker` component for the auditors.  This component should record the 5Ws (who, when, where, why and what) of any database table change.

Microsoft's SQL Server has an out of the box solution called [Change Data Capture](https://msdn.microsoft.com/en-us/library/cc645937.aspx), which is great.  However, you need an Enterprise license to enable this feature and its very expensive;  at least for us startups and open sorcerers. **yact** implements a poor man's change tracking by using [SQL triggers](http://en.wikipedia.org/wiki/Database_trigger) to insert an [audit](src/audit.dot) row.  

yact's twist is to store the before and after images of the change as XML content as opposed to most other implementations that add a row for each field that was changed.  I believe this gives a light weight and flexible (read efficient) to change tracking.

## Getting started

Install with [npm](http://blog.npmjs.org/post/85484771375/how-to-install-npm)

    > npm install -g yact

Generate the script for the table triggers and the audit table into `yact.sql`

    > yact -a Employee Payroll

## Usage

    > yact -help

 ````
 Usage: yact-cl [options] [table[:key]...]

  Generate the audit trigger script for the table(s)

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -a, --audit          include the script to create the Audit table
    -i, --individual     save the script(s) as individual files.
    -o, --output [file]  save the script(s) to the specified file, the default is "yact.sql"

  Examples:

    # create trigger script for contact table, primary key is contact_id
    yact contact

    # create trigger script for contact table, primary key is id
    yact contact:id
 ````
 
## The trigger

The magic in the [trigger](src/trigger.dot) is to join the `inserted` and `deleted` tables and then convert the rows to XML. These tables  are supplied by the SQL server when the trigger is invoked.  Each table has the same columns as `table_name`.

```sql
insert into audit (table_name, old_content, new_content) 
  select 
    @table_name,
    case when d.table_id is null then null else (select d.* for xml raw) end,
    case when i.table_id is null then null else (select i.* for xml raw) end
  from inserted as i
    full outer join deleted as d on i.table_id = d.table_id
```

All you need to change is 
* declare\set `@table_name`
* change `table_id` to the name of table's primary key.

### Caveat Emptor

Triggers that insert (as yact does) change the `@@identity` value.  All stored procedures should at least use `scope_identity()` instead of `@@identity`; see [how not to retrieve identity value](http://www.sqlbadpractices.com/how-not-to-retrieve-identity-value/) for more issues.

## audit table

All changes (`insert`, `update` or `delete`) to a yact monitored table are stored in the [audit table](src/audit.dot).

| Column | Description |
| ------ | ----------- |
| audit_id | A unique key for this audit entry.  Keeps an [ORM](http://en.wikipedia.org/wiki/Object-relational_mapping) happy. |
| operation | The SQL operation (`insert`, `update` or `delete`) performed on the *table_name*. |
| table_name | **What** information was changed. | 
| old_content | **What** was the old information; formatted as XML. Each column of the row is an XML attribute. | 
| new_content | **What** is the new information; foratted as XML. Each column of the row is an XML attribute. | 
| who | **Who** changed this information. | 
| when | **When** was the information changed. |  
| where | **Where** was the change performed from (IP address of the SQL client). | 
| why | **Why** was this change performed.  *Not yet implemented.* |

### Who are you

Identity is hard, queue [Keith Moon](http://en.wikipedia.org/wiki/Keith_Moon)'s [drum roll](https://www.youtube.com/watch?v=PdLIerfXuZ4). *yact* uses the [system_user](https://msdn.microsoft.com/en-us/library/ms179930.aspx) for the default *who* value.  This is appopriate for client/server (2-tier) systems; where each user logs into the database.  But, for most 3-tier systems, the server has its own account for the database. In this scenario the *who* must be supplied by the trigger.  

Many 3-tier systems have a *modifiedBy* column in each table.  In this case the trigger can be changed to use this column

```sql
insert into audit (table_name, who, old_content, new_content) 
  select 
    @table_name,
    IsNull(i.modifiedBy, d.ModifiedBy),
    case when d.table_id is null then null else (select d.* for xml raw) end,
    case when i.table_id is null then null else (select i.* for xml raw) end
  from inserted as i
    full outer join deleted as d on i.table_id = d.table_id
```

### Time is relative

*yact* defaults *when* to [sysdatetimeoffset](https://msdn.microsoft.com/en-us/library/bb677334.aspx), which includes the time zone offset of the SQL server.  This *works* if all users are in the same time zone.  If the software system has the user's time, then this value should be used in trigger's `insert`.

By using the time zone offset, its possible to determine if the user accessed the system after working hours.

However, its not possible to determine if the user accessed the system during a public holiday.

