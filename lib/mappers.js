/**
 * Express MyBatis Mapper
 */
const mybatisMapper = require('mybatis-mapper');
var namespace = '';
function Mapper() {

}

/*
*Load File XML Mapper
*/
Mapper.prototype.loadMapper = function(xmlFileName) {
	// create the myBatisMapper from xml file
	mybatisMapper.createMapper([ './mappers/'+xmlFileName+'.xml' ]);
}

/*
*Set Name Space XML Mapper
*/
Mapper.prototype.setNameSpace = function(__namespace) {
	namespace = __namespace;
}

/*
*Get SQL String Based on XML Mapper
*/
Mapper.prototype.onQuery = function(namespace, idSentence, param) {
	return mybatisMapper.getStatement(namespace, idSentence, param, {language: 'sql', indent: '  '});
}

Mapper.prototype.onQuery = function(idSentence, param) {
	if(namespace === '') if (error) throw error;
	return mybatisMapper.getStatement(namespace, idSentence, param, {language: 'sql', indent: '  '});
}

module.exports = new Mapper();
