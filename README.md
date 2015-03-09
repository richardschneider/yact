# yact

Yet another change tracker.  Most software systems require a `Change Tracker` component for the auditors.  This component should record the 5Ws (who, when, where, why and what) of any database change.

Microsoft's SQL Server has an out of the box solution called Change Data Capture, which is great.  However, you need an Enterprise license to enable this feature and its very expensive;  at least for us startups and open sorcerers. *yact* implements change tracking by using [SQL triggers]() to insert an `Audit` row.  

yact's twist is to store the before and after images of the change as XML content as opposed to most other implementations that add a row for each field that was changed.  I believe this gives a light weight and flexible (read efficient) to change tracking.

Here's the magic in the trigger
```sql
insert into audit
  (table_name, old_content, new_content) 
  select 
    @operation,
    @table_name,
    case when d.table_id is null then null else (select d.* for xml raw) end,
    case when i.table_id is null then null else (select i.* for xml raw) end
  from inserted as i
    full outer join deleted as d on i.table_id = d.table_id
```
All you need to change is to declare\set `@table_name` and change `table_id` to the name of table's primary key.






