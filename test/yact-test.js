var should = require('chai').should(),
    yact = require('../src/yact');

describe('trigger script', function() {
  it('creates the trigger for a table', function() {
    var config = {
		table: 'xtable'
	};
    yact.script(config).should.contain('xtable');
  });

  it('defaults primary key name to table_id', function() {
    var config = {
		table: 'xtable'
	};
    yact.script(config).should.contain('xtable_id');
  });
  
  it('allows primary key name to be specified', function() {
    var config = {
		table: 'xtable',
		primaryKey: 'xid'
	};
    yact.script(config).should.contain('xid');
  });

});

describe('audit script', function() {
  it('creates the SQL for the Audit table', function() {
    yact.auditScript().should.contain('audit');
  });

});
 