--
-- This a template for a yact auditing trigger.
-- You MUST replace the following strings
--  - {table_name} with the name of the table to audit
--  - {table_key} with the name of the table's primary key
--
create trigger [trg_{table_name}]
on {table_name} for insert, update, delete not for replication
as
begin
	set NOCOUNT on

    insert into audit (table_name, old_content, new_content)
    select
    	'{table_name}',
	    case when d.{table_key} is null then null else (select d.* for xml raw) end,
	    case when i.{table_key} is null then null else (select i.* for xml raw) end
	    from inserted as i
	    full outer join deleted as d on i.{table_key} = d.{table_key}
end
