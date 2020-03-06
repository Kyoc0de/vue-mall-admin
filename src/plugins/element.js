import Vue from 'vue'
import { Button } from 'element-ui'
import { Form, FormItem } from 'element-ui'
import { Input } from 'element-ui'
//导入弹框提示组件 (不同需要挂载)
import { Message } from 'element-ui'


Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
//讲弹窗组件挂载到vue上 可通过this.$message访问
Vue.prototype.$message = Message
