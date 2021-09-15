const Mysql = require('@wangct/mysql');
const {logErr} = require("@wangct/node-util/lib/log");
const {baseMysqlConfig} = require("./options");
const {baseFields} = require("./options");
const {toAry,callFunc,isNum,isStr} = require('@wangct/node-util');


class Tree{

  constructor(options = {}){
    this.props = options;
    this.initMysql();
  }

  getMysqlConfig(){
    return {
      ...baseMysqlConfig,
      ...this.getProp('mysql'),
    };
  }

  removeDbTable(){
    return this.getMysql().query('drop table ' + this.getTableName()).catch((e) => {
      logErr(e);
    });
  }

  async initMysql(){
    if(!this.useDb()){
      return;
    }
    const mysqlConfig = this.getMysqlConfig();
    const mysql = new Mysql(mysqlConfig);
    this.setMysql(mysql);

    await this.removeDbTable();

    mysql.query(`CREATE TABLE IF NOT EXISTS ${mysqlConfig.table}${getItemCreateSqls([...baseFields,...toAry(this.getProp('fields'))])}ENGINE=${mysqlConfig.engine} DEFAULT CHARSET=${mysqlConfig.charset}`).then((data) => {
      callFunc(this.getProp('onCreateTable'),data);
    });
  }

  setMysql(mysql){
    return this.setProp('mysqlTarget',mysql);
  }

  getMysql(){
    return this.getProp('mysqlTarget');
  }

  useDb(){
    // host:'localhost',
    //   port:'3306',
    //   user:'root',
    //   password:'123456',
    //   database:'test'
    return this.getProp('mysql');
  }

  getProp(field){
    return this.props[field];
  }

  setProp(field,value){
    this.props[field] = value;
  }

  create(data){
    return this.getMysql().insert({
      table:this.getTableName(),
      data,
    });
  }

  remove(data){
    const nodeId = getNodeId(data);
    return this.getMysql().remove({
      table:this.getTableName(),
      tree_id:nodeId,
    });
  }

  update(data){
    return this.getMysql().update({
      table:this.getTableName(),
      data,
    });
  }

  getNode(nodeId){
    return this.getMysql().search({
      table:this.getTableName(),
      where:{
        tree_id:nodeId,
      },
    }).then((data) => data[0]);
  }

  getTableName(){
    return this.getMysqlConfig().table;
  }



}

function getNodeId(node = {}){
  if(isStr(node) || isNum(node)){
    return node;
  }
  return node.node_id;
}

function getItemCreateSqls(fields = []){
  return '(' + toAry(fields).map(getItemCreateSql).join(',') + ')';
}

function getItemCreateSql(opt = {}){
  return `${opt.name} ${opt.type}${opt.length ? `(${opt.length})` : ''} ${opt.auto_increment ? 'AUTO_INCREMENT' : ''} ${opt.primary_key ? 'PRIMARY KEY' : ''} ${opt.null === false ? 'not null' : ''}`;
}

exports.DbTree = Tree;
