const {mysqlConfig} = require("./config/mysql");
const {DbTree} = require("../es");


const tree = new DbTree({
  mysql:mysqlConfig,
  onCreateTable:async () => {
    const data = await tree.create({
      node_name:'www'
    });
    await tree.update({
      node_id:data.insertId,
      node_name:'wd',
    });
  },
});


