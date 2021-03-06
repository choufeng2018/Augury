const { Consumer,Admin, Sequelize } = require('../../migrations/migration')

const moment =  require('moment')

class TianGans {
  
   // 获取数据
  list(page = 1,pagesize = 20,others = {},is_delete = false){
    const conditions = {};
    // 分页
    if(page > 0 && pagesize > 0){
      if(page <= 0){
        page = 1;
      }
      conditions.offset =  (page - 1) * pagesize;
      conditions.limit = pagesize;
    }
  
    // 排序
    conditions.order = [[Sequelize.col('id'),'DESC']]

     // where条件
     conditions.where = {
      is_delete:is_delete,       
     }
 
    // 时间约束
    if(others.start && others.start.trim().length && moment(others.start).isValid()){
      conditions.where.createdAt = {
        [Sequelize.Op.gt]:moment(others.start).toDate()
      }
    }
    if(others.end && others.end.trim().length && moment(others.end).isValid()){
      conditions.where.createdAt = conditions.where.createdAt || {};
      conditions.where.createdAt[Sequelize.Op.lt] = moment(others.end).toDate()
    }


    const data = TianGans.findAll(conditions);
    return data;
  }

  // 获取
  has(conditions={},excludeId=0){
   return TianGans.count({
      where:{
        ...conditions,
        id:{
          [Sequelize.Op.notIn]:[excludeId]
        }
      }
    })
  }

  // 更新各状态
  update(values,id){
   return TianGans.update(values || {} ,{
      where:{
        id:id
      }
    })
  }

  // 获取总数
  totalCount(others={},is_delete = false){
    const conditions = {};
   
     // where条件
    conditions.where = {
      is_delete:is_delete,
    }


    // 时间约束
    if(others.start && others.start.trim().length && moment(others.start).isValid()){
      conditions.where.createdAt = {
        [Sequelize.Op.gt]:moment(others.start).toDate()
      }
    }
    if(others.end && others.end.trim().length && moment(others.end).isValid()){
      conditions.where.createdAt = conditions.where.createdAt || {};
      conditions.where.createdAt[Sequelize.Op.lt] = moment(others.end).toDate()
    }


    const count =  TianGans.count(conditions);
    return count;
  }
   
   
  
  // 删除
  deleteByIds(ids = [],reverse = false){
    const deleteIds =  [...(ids||[])]
    return TianGans.update({
      is_delete:!reverse
    },{
      where:{
        id:{
          [Sequelize.Op.in]:deleteIds
        }
      }
    })
  }

  // 彻底删除
  removeByIds(ids = []){
    const removeIds =  [...(ids||[])]
    return TianGans.destroy({
      where:{
        id:{
          [Sequelize.Op.in]:removeIds
        }
      }
    })
  }

  // 添加会员
  insert(values){
    return TianGans.create(values)
  }
  
  // 查询
  findOne(id){
    return TianGans.findOne({ where:{
      id:id,
      }
    })
  }
}


module.exports = new TianGans();