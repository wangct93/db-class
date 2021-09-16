const {DbTable} = require("../DbTable");
const {baseFields} = require("./options");

/**
 * 树型表结构
 */
class DbTree extends DbTable{

  constructor(options = {}){
    options = {
      baseFields,
      ...options,
    };
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

    const getNode = (nodeId) => {
      return this.getMysql().search({
        table:this.getTableName(),
        fields:['node_id','node_name','parent'],
        where:{
          node_id:nodeId,
        },
      }).then((data) => data[0]);
    };
    const result = [
      {
        node_id:node.node_id,
        node_name:node.node_name,
      },
    ];
    while (node && node.parent != null){
      node = await getNode(node.parent);
      if(node){
        result.unshift({
          node_id:node.node_id,
          node_name:node.node_name,
        });
      }
    }
    return result;
  }

}

exports.DbTree = DbTree;
