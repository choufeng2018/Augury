layui.define(['form','layer','global'], function(exports){
    $ = layui.jquery;
  const form = layui.form
  ,global = layui.global
  ,layer = layui.layer;
  
  //自定义验证规则
  form.verify({
    name: function(value){
      if(value.length < 5){
        return '名称至少得4个字符啊';
      }
    }
  });

  const isDialog = !!parent.layer.getFrameIndex(window.name)
  let body = {};
  if(isDialog && parent.$){
    const iframe =  parent.$(`iframe[name=${window.name}]`)
    body = global.getParamsWithUrl(iframe.attr('src'))
  }

  let rels = null
  // 获取权限列表,读取分类
  global.ajax({
    url:'/api/v1/cate/allList',
    type:'GET',
    data:{
        auths:true
    },
    success:function(data){
      if(!data.code){
        const html =  template('cateList',{cateList:data.data.list})
        $('.roleList').html(html) 
        if(rels){
            const set = new Set()
                for(let rel of rels){
                    const authObj = $('#auth'+rel.auth_id)
                    authObj.prop('checked',true)
                    const cateId = authObj.attr('data-cate-id')
                    if(cateId)set.add(cateId)
                }
                for(let cateId of set){
                    const length = $('input[data-cate-id="'+cateId+'"]:checked').size()
                    const cateObj = $('#cate'+cateId)
                    cateObj.prop('checked',cateObj.attr('data-length') == length)
                }
        }
        form.render('checkbox')
      }else{
        layer.msg(data.message,{icon:2,shade:0.2,time:500});
      }
    },
    error:function(data){
        layer.msg('服务器开小差了，刷新重试',{icon:2,shade:0.2,time:500});
    }
  })

  if(body.role_id){
    // 获取详情
    global.ajax({
        url:'/api/v1/role/detail/'+body.role_id,
        type:"GET",
        success:function(data){
            if(!data.code){
                $('#name').val(data.data.name)
                $('#remark').val(data.data.remark)
                $('#enable'+(data.data.enable?'1':'0')).prop('checked',true)

                rels = data.data.auth_role_rels;
                const set = new Set()
                for(let rel of data.data.auth_role_rels){
                    const authObj = $('#auth'+rel.auth_id)
                    authObj.prop('checked',true)
                    const cateId = authObj.attr('data-cate-id')
                    if(cateId)set.add(cateId)
                }
                for(let cateId of set){
                    const length = $('input[data-cate-id="'+cateId+'"]:checked').size()
                    const cateObj = $('#cate'+cateId)
                    cateObj.prop('checked',cateObj.attr('data-length') == length)
                }
                form.render('checkbox')
                form.render('radio')
            }else{
              layer.msg(data.message,{icon:2,shade:0.2,time:500});
            }
        },
        error:function(){
            layer.msg('服务器开小差了，刷新重试',{icon:2,shade:0.2,time:500});
        }
    })
   }
  
  form.on('checkbox(cate)', function(data){
    // 只要有未选中的 则取消全部选中
    const cateObj = $(data.elem)
    cateObj.parents('td').next('td').find("input[type='checkbox']").prop('checked',data.elem.checked)
    form.render('checkbox')
  }); 
  
  form.on('checkbox(auth)', function(data){
    // 只要有未选中的 则取消全部选中
    const cateObj = $(`#cate${data.elem.dataset.cateId}`)
    if(!data.elem.checked){
        cateObj.prop('checked',false)
        form.render('checkbox')
    }else{
        // 获取所有该分类的权限
        const totalLength =  cateObj.get(0).dataset.length;
        const selectedLength = cateObj.parents('td').next('td').find('input:checked').length
        if(totalLength  == selectedLength){
            cateObj.prop('checked',true);
            form.render('checkbox')
        }
    }
  });  
  
  //监听提交
  form.on('submit(edit)', function(data){
    // 弹出提示
    let index = null;
    const id = setTimeout(() => {
        clearTimeout(id);
        if(!index){
            index = layer.msg('玩命卖萌中...',{type:1,shade:0.5,time:0});
        }
    }, 1000);
    
    const authIds = []
    const authObjs =  $("input[name='auth']");
    if(authObjs){
        for(let i = 0;i < authObjs.length; i ++){
            if(authObjs[i].checked){
                authIds.push(authObjs[i].value)
            }
        }
    }
    
    global.ajax({
        url:'/api/v1/role/edit/'+body.role_id,
        traditional:true,
        data:{
            name:data.field.name,
            cateId:data.field.cateId,
            remark:data.field.remark,
            authIds:authIds
        },
        method:'POST',
        type:'json',
        success:function(data){
            layer.close(index);
            index = " ";
            //发异步，把数据提交给php
            if(data.code){
                layer.msg(data.message,{icon:2,shade:0.2,time:500});
                return;
            }
  
            layer.alert(data.message, {icon: 6},function () {
                global.emit("authListRefresh")
                // 获得frame索引
                var index = parent.layer.getFrameIndex(window.name);
                //关闭当前frame
                parent.layer.close(index);
            });
        },
        error:function(err){
            layer.msg('服务器开小差了',{icon:2,shade:0.2,time:500});
            layer.close(index);
            index = " ";
        }
    })
    
    return false;
  });

  exports('roleEdit',{})
  });