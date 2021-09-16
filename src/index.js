const {mysqlConfig} = require("./config/mysql");
const {DbTree} = require("../es");


const tree = new DbTree({
  mysql:{
    ...mysqlConfig,
    table:'wwww',
  },
  onCreateTable:async () => {
    const data = await tree.create({
      node_name:'www'
    });
    await tree.update({
      node_id:data.insertId,
      node_name:'wd',
    });
    const child = await tree.create({
      node_name:'wwww',
      parent:data.insertId,
    });
    const info = await tree.getDetail(child.insertId);
    console.log(info);
  },
});


