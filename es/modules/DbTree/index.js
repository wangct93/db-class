const {DbTable} = require("../DbTable");

/**
 * 树型表结构
 */
class DbTree extends DbTable{

  constructor(options = {}){
    options = {
      idField:'node_id',
      nameField:'node_name',
      ...options,
    };
    options.baseFields = options.baseFields || [
      {
        field:options.idField,
        type:'int',
        length:11,
        primary_key:true,
        auto_increment:true,
      },
      {
        field:options.nameField,
        type:'varchar',
        length:255,
      },
      {
        field:'parent',
        type:'int',
        length:11,
      },
      {
        field:'node_type',
        type:'int',
        length:11,
      },
      {
        field:'create_time',
        type:'datetime',
      },
      {
        field:'update_time',
        type:'datetime',
      },
    ];
    super(options);
  }

  getDetail(nodeId){
    return super.getDetail(nodeId).then(async (data) => {
      if(data){
        const depth_node_list = await this.getDepthNodeList(data);
        return {
          ...data,
          depth_node_list,
        };
      }
      return null;
    });
  }

  async getDepthNodeList(node){

    const idField = this.getPrimaryField();
    const nameField = this.getProp('nameField');
    const getNode = (nodeId) => {
      return this.getMysql().search({
        table:this.getTableName(),
        fields:[idField,nameField,'parent'],
        where:{
          [idField]:nodeId,
        },
      }).then((data) => data[0]);
    };
    const result = [
      {
        [idField]:node[idField],
        [nameField]:node[nameField],
      },
    ];
    while (node && node.parent != null){
      node = await getNode(node.parent);
      if(node){
        result.unshift({
          [idField]:node[idField],
          [nameField]:node[nameField],
        });
      }
    }
    return result;
  }

  async getTree(nodeId){
    nodeId = this.getId(nodeId);
    const idField = this.getPrimaryField();
    let nodeList = [];
    if(nodeId){
      nodeList = await this.search({
        [idField]:nodeId,
      });
    }else{
      nodeList = await this.search({
        parent:null,
      });
    }

    const getChildren = (nodeId) => {
      return this.search({
        parent:nodeId
      }).then((data) => data.map((item) => ({
        ...item,
        children:getChildren(item[idField])
      })));
    };
    return nodeList.map((node) => ({
      ...node,
      children:getChildren(node[idField]),
    }));
  }

}

exports.DbTree = DbTree;
