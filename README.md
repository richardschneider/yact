# yact

Yet another change tracker.  Most software systems require a `Change Tracker` component for the auditors.  This component should record the 5Ws (who, when, where, why and what) of any database change.

Microsoft's SQL Server has an out of the box solution called [Change Data Capture](https://msdn.microsoft.com/en-us/library/cc645937.aspx), which is great.  However, you need an Enterprise license to enable this feature and its very expensive;  at least for us startups and open sorcerers. *yact* implements poor man's change tracking by using [SQL triggers](http://en.wikipedia.org/wiki/Database_trigger) to insert an [audit](audit.sql) row.  

yact's twist is to store the before and after images of the change as XML content as opposed to most other implementations that add a row for each field that was changed.  I believe this gives a light weight and flexible (read efficient) to change tracking.

## The trigger

The magic in the [trigger](trigger-template.sql) is to join the `inserted` and `deleted` tables and then convert the rows to XML. These tables  are supplied by the SQL server when the trigger is invoked.  Each table has the same columns as `table_name`.

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

## Caveat Emptor

Triggers that insert (as yact does) change the `@@identity` value.  All stored procedures should at least use `scope_identity()` instead of `@@identity`; see [how not to retrieve identity value](http://www.sqlbadpractices.com/how-not-to-retrieve-identity-value/) for more issues.





