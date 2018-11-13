process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Comment = require('../model/comment');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);

describe('Comments', () => {
    beforeEach((done) => { //Before each test we empty the database
        Comment.remove({}, (err) => {
            done();
        });
    });

    describe('/GET comments', () => {
        it('It should GET all the comments', (done) => {
            chai.request(server)
                .get('/api/comments/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                    done();
                });
        });
    });

    describe('/POST comment', () => {
       it("It should return one posted comment", (done) => {
           let comment = {
               author: '5bde0a49bf78e441b28e0fb8',
               description: 'Test comment',
           };

           chai.request(server)
               .post('/api/comments/')
               .send(comment)
               .end((err, res) =>  {
                   res.should.have.status(200);
                   res.body.should.be.a('object');
                   res.body.should.have.property('description').eql('Test comment');
                   res.body.should.have.property('author').eql('5bde0a49bf78e441b28e0fb8');
                   res.body.should.have.property('_id');
                   res.body.should.have.property('votes').eql(0);
                   res.body.should.have.property('votedby');
                   done();
               })
       })
    });
});