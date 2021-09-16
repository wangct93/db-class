

exports.baseFields = [
  {
    field:'node_id',
    type:'int',
    length:11,
    primary_key:true,
    auto_increment:true,
  },
  {
    field:'node_name',
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

