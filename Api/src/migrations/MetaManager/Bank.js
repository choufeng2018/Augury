
const { sequelize, Sequelize } = require('../../utils/SequelizeInit')
const moment = require('moment')
const { domain } = require('../../configure/config')

const Gift = sequelize.define('meta_bank', {
  name: { 
    type: Sequelize.STRING(40),
    allowNull: false,
    comment: '名称'
  },
  bank_code: { 
    type: Sequelize.STRING(50),
    allowNull: false,
    comment: '银行编号'
  },
  iconUrl:{
    type: Sequelize.STRING(200),
    allowNull: true,
    comment: '小图片地址'
  },
  is_delete: {
    type:Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '删除'
  }
},{
  getterMethods:{
    createdTime(){
      const time =  this.getDataValue('createdAt');
      return  moment(time).format('YYYY-MM-DD HH:mm:ss');
    },
    updatedTime(){
      const time =  this.getDataValue('updatedAt');
      return  moment(time).format('YYYY-MM-DD HH:mm:ss');
    },
    imgUrl(){
      let imgUrl = this.getDataValue('imgUrl')
      if(imgUrl){
        imgUrl =  domain+`/${imgUrl}`.replace("//",'/')
      }
      return imgUrl
    },
    thumb_imgUrl(){
      let thumb_imgUrl = this.getDataValue('thumb_imgUrl')
      if(thumb_imgUrl){
        thumb_imgUrl =  domain+`/${thumb_imgUrl}`.replace("//",'/')
      }
      return thumb_imgUrl
    }
  },
  engine: 'Innodb',//如果要createAt 和updateAt 不能用MYISAM
})

module.exports =  Gift