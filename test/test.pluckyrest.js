const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const nock = require('nock');
const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;
const expect = Code.expect;

const {
	PluckyRest,
} = require('../src/pluckyrest');

const noop = ()=>{};

describe('PluckyRest', ()=>{
	it('should return return 1 and a status string', (done) => {
		const rest = new PluckyRest();	

		rest.execute({params: {}}, (code, val) => {
			expect(code).to.equal(1);
			expect(val.status).to.be.string();
			done();
		});
	});

	it('should return return 0 and a result string', (done) => {
		const rest = new PluckyRest();	
		const mockedRequest = nock('http://www.test.com')
			.get('/resource')
			.reply(200);

		rest.execute({params: {url: 'http://www.test.com/resource', method:'GET'}}, (code, val) => {
			expect(code).to.equal(0);
			expect(val.result).to.be.string();
			expect(mockedRequest.isDone()).to.be.a.boolean().and.equal(true);
			done();
		});
	});

	it('should return return 0 and the result of the response', (done) => {
		const rest = new PluckyRest();	
		const mockedRequest = nock('http://www.test.com')
			.get('/resource')
			.reply(200, {some:'payload'});

		rest.execute({params: {url: 'http://www.test.com/resource', method:'GET'}}, (code, val) => {
			expect(code).to.equal(0);
			expect(val.result).to.be.object();
			expect(mockedRequest.isDone()).to.be.a.boolean().and.equal(true);
			done();
		});
	});

	it('should return return 1 and the status of the response', (done) => {
		const rest = new PluckyRest();	
		const mockedRequest = nock('http://www.test.com')
			.get('/resource')
			.reply(400, 'bad request');

		rest.execute({params: {url: 'http://www.test.com/resource', method:'GET'}}, (code, val) => {
			expect(code).to.equal(1);
			expect(val.status).to.be.object();
			expect(mockedRequest.isDone()).to.be.a.boolean().and.equal(true);
			done();
		});
	});

});
