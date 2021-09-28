const Mysql = require('@wangct/mysql');
const moment = require("moment");
const {getItemCreateSqls} = require("../../utils/sqlUtil");
const {mysqlConfig} = require("../../config/mysqlConfig");
const {logErr} = require("@wangct/node-util/lib/log");
const {baseFields} = require("./options");
const {toAry,callFunc,isNum,isStr} = require('@wangct/node-util');

/**
 * 表结构
 */
class DbTable{

  constructor(options = {}){
    this.props = options;
    this.initMysql();
  }

  getMysqlConfig(){
    const defaultFields = toAry(this.getProp('baseFields') || baseFields);
    return {
      ...mysqlConfig,
      ...this.getProp('mysql'),
      fields:[...defaultFields,...toAry(this.getProp('fields'))]
    };
  }

  getPrimaryField(){
    const fields = this.getTableFields();
    const target = fields.find((field) => field.primary_key) || fields[0];
    return target && target.field;
  }

  getTableFields(){
    return this.getMysqlConfig().fields;
  }

  removeDbTable(){
    return this.getMysql().query('drop table if exists ' + this.getTableName()).catch((e) => {
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

    if(mysqlConfig.init){
      await this.removeDbTable();
    }

    mysql.query(`CREATE TABLE IF NOT EXISTS ${mysqlConfig.table}${getItemCreateSqls(this.getTableFields())}ENGINE=${mysqlConfig.engine} DEFAULT CHARSET=${mysqlConfig.charset}`).then((data) => {
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
      data:{
        ...data,
        create_time:moment().format('YYYY-MM-DD HH:mm:ss'),
        update_time:moment().format('YYYY-MM-DD HH:mm:ss'),
      },
    });
  }

  remove(data){
    const id = this.getId(data);
    return this.getMysql().delete({
      table:this.getTableName(),
      data:{
        [this.getPrimaryField()]:id,
      },
    });
  }

  delete(...args){
    return this.remove(...args);
  }

  update(data){
    const key = this.getPrimaryField();
    return this.getMysql().update({
      table:this.getTableName(),
      data:{
        ...data,
        update_time:moment().format('YYYY-MM-DD HH:mm:ss'),
      },
      where:{
        [key]:data[key],
      },
    });
  }

  search(data,options = {}){
    if(!options.fields){
      const timeFields = this.getTableFields().filter((item) => item.type === 'datetime');
      options.fields = [
        '*',
        ...timeFields.map((item) => ({
          field:item.field,
          isTime:true,
        })),
      ];
    }

    return this.getMysql().search({
      table:this.getTableName(),
      where:data,
      orderField:'create_time',
      orderDesc:true,
      ...options,
    });
  }

  getId(data){
    if(isStr(data) || isNum(data)){
      return data;
    }
    return data[this.getPrimaryField()];
  }

  async getDetail(id){
    id = this.getId(id);
    if(id == null){
      return null;
    }
    return this.getMysql().search({
      table:this.getTableName(),
      where:{
        [this.getPrimaryField()]:id,
      },
    }).then((data) => data[0]);
  }

  getInfo(id){
    return this.getDetail(id);
  }


  getTableName(){
    return this.getMysqlConfig().table;
  }

}

exports.DbTable = DbTable;
