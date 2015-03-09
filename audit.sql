create table audit
(
	audit_id int identity(1,1) not null primary key, 
    [operation] char not null, 
    table_name varchar(128) not null, 
    old_content xml null, 
    new_content xml null, 
    who nvarchar(128) not null default system_user, 
    [when] datetimeoffset not null default sysdatetimeoffset(), 
    [where] nvarchar(128) null, 
    why nvarchar(128) null
)
