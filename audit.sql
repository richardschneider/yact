create table audit
(
    audit_id int identity(1,1) not null primary key, 
	[operation] as case
	  when old_content is null and new_content is not null then 'insert'
	  when old_content is not null and new_content is not null then 'update'
	  when old_content is not null and new_content is null then 'delete'
	  when old_content is null and new_content is null then 'select'
	end,
    table_name varchar(128) not null, 
    old_content xml null, 
    new_content xml null, 
    who nvarchar(128) not null default system_user, 
    [when] datetimeoffset not null default sysdatetimeoffset(), 
    [where] nvarchar(128) null default convert(nvarchar, connectionproperty('client_net_address')), 
    why nvarchar(128) null
)
