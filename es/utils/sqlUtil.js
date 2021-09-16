const {toAry} = require("@wangct/util/lib/arrayUtil");


function getItemCreateSqls(fields = []){
  return '(' + toAry(fields).map(getItemCreateSql).join(',') + ')';
}

function getItemCreateSql(opt = {}){
  return `${opt.field} ${opt.type}${opt.length ? `(${opt.length})` : ''} ${opt.auto_increment ? 'AUTO_INCREMENT' : ''} ${opt.primary_key ? 'PRIMARY KEY' : ''} ${opt.null === false ? 'not null' : ''}`;
}

exports.getItemCreateSqls = getItemCreateSqls;
