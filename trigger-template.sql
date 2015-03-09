--
-- This a template for a yact auditing trigger.
-- You MUST replace the following strings
--  - {table} with the name of the table to audit
--  - {table_id} with the name of the table's primary key
--
create trigger [trg_{table}]
on {table} for insert, update, delete not for replication
as
begin
	set NOCOUNT on

	-- TODO: operation should be a computed value based on the nullness of old_content and new_content
	declare @operation as char(1)
	if exists (select * from inserted)
	if exists (select * from deleted)
		select @operation = 'U'
	else
		select @operation = 'I'
	else
		select @operation = 'D'

  insert into audit (operation, table_name, old_content, new_content) 
  select
    	@operation,
    	'{table}',
	case when d.{table_id} is null then null else (select d.* for xml raw) end,
	case when i.{table_id} is null then null else (select i.* for xml raw) end
	from inserted as i
	full outer join deleted as d on i.{table_id} = d.{table_id}
end
