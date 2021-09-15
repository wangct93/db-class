
exports.baseMysqlConfig = {
  table:'tree',
  table_link:'tree_link',
  engine:'InnoDB',
  charset:'utf8',
};

exports.baseFields = [
  {
    name:'node_id',
    type:'int',
    length:11,
    primary_key:true,
    auto_increment:true,
  },
  {
    name:'node_name',
    type:'varchar',
    length:255,
  },
  {
    name:'parent',
    type:'int',
    length:11,
  },
  {
    name:'node_type',
    type:'int',
    length:11,
  },
];
