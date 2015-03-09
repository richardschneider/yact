# yact

Yet another change tracker.  Most software systems require a `Change Tracker` component for the auditors.  This component should record the 5Ws (who, when, where, why and what) of any database change.

Microsoft's SQL Server has an out of the box solution called Change Data Capture, which is great.  However, you need an Enterprise license to enable this feature and its very expensive;  at least for us startups and open sorcerers. *yact* implements change tracking by using [SQL triggers]() to ... 
