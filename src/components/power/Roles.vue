<template>
    <div>
        <!--        面包屑-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
<!--    卡片视图-->
        <el-card>
            <el-row>
                <el-col>
<!--                    <el-button type="primary">添加角色</el-button>-->
                    <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
                </el-col>
            </el-row>
<!--            角色列表区域-->
            <el-table :data="rolelist" border stripe>
<!--                展开列-->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom',i1===0?'bdtop':'','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id" >
<!--                            一级权限-->
                            <el-col :span="5">
                                <el-tag  closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
<!--                            二级和三级-->
                            <el-col :span="19">
<!--                                通过for循环嵌套渲染二级权限-->
                                <el-row :class="[i2===0? '':'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="i2">
                                    <el-col :span="6">
                                        <el-tag type="success"  closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag type="warning" v-for="(item3 ) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">
                                            {{item3.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
                        <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeRoleById(scope.row.id)">删除</el-button>
<el-button type="warning" size="mini" icon="el-icon-setting" @click="showSetRightDialog(scope.row)" >分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

<!--        添加用户对话框-->
        <el-dialog
                title="添加角色"
                :visible.sync="addDialogVisible"
                width="50%"
                @close="addDialogClosed"
        >
            <!--            内容主体区域-->
            <el-form :model="addRoleForm" :rules="addRoleRules" ref="addRoleFormRef" label-width="80px" >
                <el-form-item label="角色姓名" prop="roleName">
                    <el-input v-model="addRoleForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addRoleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!--            底部区域-->
            <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addRole">确 定</el-button>
  </span>
        </el-dialog>
        <!--修改用户对话框-->
        <el-dialog
                title="修改用户信息"
                :visible.sync="editDialogVisible"
                width="50%"
                @close="editDialogClosed"
        >
            <!--            内容主体区域-->
            <el-form :model="editRoleForm" :rules="editRoleFormRules" ref="editRoleFormRef" label-width="80px" >
                <el-form-item label="角色id" prop="username">
                    <el-input v-model="editRoleForm.roleId" disabled></el-input>
                </el-form-item>
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editRoleForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editRoleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!--            底部区域-->
            <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
        </el-dialog>
<!--        分配权限的对话框-->
        <el-dialog
                title="分配权限"
                :visible.sync="setRightDialogVisible"
                width="50%"
                @close="setRightDialogClosed"
        >
<!--            树形控件-->
            <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data(){
            return{
                //所有角色列表
                rolelist:[],
                rightsList: [],
                addDialogVisible: false,
                //    添加角色的表单数据
                addRoleForm: {
                    roleName:'',
                    roleDesc: ''
                },
                editRoleForm:{
                },
                //    添加表单的验证规则对象
                addRoleRules:{
                    roleName:[
                        {
                            required: true,message:'请输入角色名称',trigger:'blur'
                        }
                    ],
                    roleDesc:[
                        {
                            required: true,message:'请输入角色描述',trigger:'blur'
                        }
                    ],
                },
                editRoleFormRules:{
                    roleName:[
                        {
                            required: true,message:'请输入角色名称',trigger:'blur'
                        }
                    ],
                    roleDesc:[
                        {
                            required: true,message:'请输入角色描述',trigger:'blur'
                        }
                    ],
                },
                //控制修改用户对话框的显示与隐藏
                editDialogVisible:false,
                //控制修改用户权限对话框的显示与隐藏
                setRightDialogVisible: false,

                //树形控件的绑定对象
                treeProps:{
                    label:'authName',
                    children:'children'
                },
                //默认选中节点数组
                defKeys:[],

                roleId:''
            }
        },
        created() {
            this.getRolesList()
        },
        methods:{
        //    获取所有角色的列表
            async getRolesList(){
                const {data:res} = await this.$http.get('roles')
                if(res.meta.status!==200){
                    return this.$message.error('获取用户列表失败!')
                }
                this.rolelist = res.data

            },
            addDialogClosed(){
                this.$refs.addRoleFormRef.resetFields()
            },
            //点击按钮,添加新用户
            addRole(){
                this.$refs.addRoleFormRef.validate( async valid=>{
                    if(!valid) return
                    //    可以发起用户请求
                    const {data: res} = await this.$http.post('roles',this.addRoleForm)

                    if(res.meta.status !== 201){
                        this.$message.error('添加角色失败!')
                    }
                    this.$message.success('添加角色成功!')
                    //隐藏添加用户对话框
                    this.addDialogVisible = false
                    //重新获取用户列表数据
                    this.getRolesList()
                })
            },
            //    监听修改用户对话框的修改事件
            editDialogClosed(){
                this.$refs.editRoleFormRef.resetFields()
            },
            //展示编辑用户对话框
            async showEditDialog(id){
                const{data: res}=await this.$http.get('roles/'+id)

                if(res.meta.status!==200){
                    return this.$message.error("查询用户信息失败!")
                }
                this.editRoleForm = res.data
                this.editDialogVisible = true
            },
            //编辑用户信息
            editUserInfo(){
                this.$refs.editRoleFormRef.validate(async valid => {
                    if(!valid) return
                    //发起修改用户信息的数据请求
                    console.log(this.editRoleForm.roleName)
                    const{data: res}=await this.$http.put(
                        'roles/'+this.editRoleForm.roleId,
                        {
                            roleName:this.editRoleForm.roleName,
                            roleDesc:this.editRoleForm.roleDesc
                        }
                    )


                    if(res.meta.status !== 200){
                        return this.$message.error('更新用户失败')
                    }

                    //关闭对话框
                    this.editDialogVisible = false
                    //刷新数据列表
                    this.getRolesList()
                    //提示修改成功
                    this.$message.success('修改成功')
                })
            },
            //根据id删除对应的数据
            async removeRoleById(id){
                //弹框询问是否删除数据
                const confirmResult = await this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err=> err)
                //用户确认删除,返回值字符串confirm
                //用户取消删除,返回cancel
                if(confirmResult!=='confirm'){
                    return this.$message.info('已经取消了删除')
                }
                console.log(id)
                const {data: res} = await this.$http.delete('roles/'+id)
                if(res.meta.status!==200){
                    return this.$message.error('删除用户失败')
                }

                this.$message.success('删除用户成功!')
                this.getRolesList()
            },
            //删除权限
            async removeRightById(role,rightId){
            //    弹框提示是否删除
                const confirmResult = await this.$confirm('此操作无法撤销,是否永久删除','提示',{
                    confirmButtonText:'确定',
                    cancelButtonText:'取消',
                    type:'warning'
                }).catch(err=>err)

                if(confirmResult!=='confirm'){
                    return this.$message.info('取消了删除!')
                }

                const { data : res}= await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
                if(res.meta.status!==200){
                    return this.$message.error('删除权限失败')
                }

                role.children = res.data
            },
            //展示分配权限对话框
            async showSetRightDialog(role){
                this.roleId = role.id
                //获取所有权限的数据
                const {data:res} = await this.$http.get('rights/tree')
                if(res.meta.status !==200){
                    return this.$message.error('获取权限数据失败!')
                }
                //获取到的权限数据保存到data中
                this.rightslist = res.data

                console.log(this.rightslist)

                this.getLeafKeys(role,this.defKeys)

                this.setRightDialogVisible = true
            },
            getLeafKeys(node , arr){
                if(!node.children){
                    return arr.push(node.id)
                }
                node.children.forEach(item =>
                this.getLeafKeys(item,arr))
            },
            setRightDialogClosed(){
                this.defKeys = []
            },
            //点击为角色分配权限
           async allotRights(){
                const keys = [
                    ...this.$refs.treeRef.getCheckedKeys(),
                    ...this.$refs.treeRef.getHalfCheckedKeys()
                ]
                const idStr = keys.join(',')
               const {data:res} = await this.$http.post(`roles/{this.roleId}/rights`,{rids: idStr})
               if(res.meta.status !==200){
                   return this.$message.error('获数据失败!')
               }

               this.$message.success('分配权限成功')
               this.getRolesList()
               this.setRightDialogVisible =false
            }

        }
    }
</script>

<style lang="less" scoped>
.el-tag{
    margin: 7px;
}

    .bdtop{
        border-top: 1px solid #eee;
    }
    .bdbottom{
        border-bottom: 1px solid #eee;
    }
    .vcenter{
        display: flex;
        align-items: center;
    }
</style>