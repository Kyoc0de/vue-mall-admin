<template>
    <div>
        <!--       面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
<!--        卡片视图-->
        <el-card>
            <el-alert title="注意:只允许为第三级分类设置相关参数" :closable="false" show-icon type="warning"></el-alert>
<!--            选择商品分类区域-->
            <el-row class="cat_opt">
                <el-col>
                    <span>选中商品分类: </span>
<!--                    选择商品分类的级联选择框-->
                    <el-cascader
                            v-model="selectedCateKeys"
                            :options="catelist"
                            :props="{
                                expandTrigger: 'hover',
                                value:'cat_id',
                                label:'cat_name',
                                children:'children'
                             }"
                            @change="handleChange"></el-cascader>

                </el-col>
            </el-row>

<!--        tab-->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
<!--           动态参数表格         -->
                    <el-table :data="manyTableData" border stripe>
<!--                        展开行-->
                        <el-table-column type="expand"></el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope>
                                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog">编辑</el-button>
                                <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
                    <el-table :data="onlyTableData" border stripe>
                        <!--                        展开行-->
                        <el-table-column type="expand"></el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope>
                                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog">编辑</el-button>
                                <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>

            </el-tabs>
        </el-card>

<!--        添加参数对话框-->
        <el-dialog
                :title="'添加'+titleText"
                :visible.sync="addDialogVisible"
                width="50%"
                @close="addDialogClosed"
        >
<!--            添加参数对话框-->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" >
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addParams">确 定</el-button>
  </span>
        </el-dialog>
<!--        修改参数的对话框-->
        <el-dialog
                :title="'修改'+titleText"
                :visible.sync="editDialogVisible"
                width="50%"
                @close="editDialogClosed"
        >
            <!--            添加参数对话框-->
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" >
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addParams">确 定</el-button>
  </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data(){
            return{
                //商品分类列表
                editDialogVisible:false,
                catelist:[],
                selectedCateKeys:[],
                activeName: 'many',
                manyTableData:[],
                onlyTableData:[],
                //控制添加对话框的显示与隐藏
                addDialogVisible:false,
            //    添加参数的表单对象
                addForm:{
                    attr_name: ''
                },
                //添加表单数据验证
                addFormRules:{
                    attr_name: [{
                        required:true,
                        message:'请输入名称',
                        trigger:'blur'
                    }]
                },
                editForm:{

                },
                editFormRules: {
                    attr_name: [{
                        required:true,
                        message:'请输入名称',
                        trigger:'blur'
                    }]
                }
            }
        },
        created() {
            this.getCateList()
        },
        methods:{
        //获取所有的商品分类列表
            async getCateList(){
                const { data : res } = await this.$http.get('categories')
                if(res.meta.status!==200){
                    return this.$message.error("获取商品分类失败")
                }
                this.catelist = res.data

                console.log(this.catelist)
            },
        //    级联选择框
             handleChange(){
                this.getParamsData()
            },
            //tab页签点击处理时间
            handleTabClick(){
                console.log(this.activeName)
                this.getParamsData()
            },
            async getParamsData(){
                if (this.selectedCateKeys.length!==3){
                    this.selectedCateKeys = []
                    return
                }

                // 证明选中的是三级分类
                const { data:res } = await this.$http.get(`categories/${this.cateId}/attributes`,
                    {
                        params:{ sel: this.activeName}
                    })
                console.log(res)

                if(res.meta.status !== 200){
                    return this.$message.error('获取参数失败')
                }

                if(this.activeName === 'many'){
                    this.manyTableData = res.data
                }else{
                    this.onlyTableData = res.data
                }
            },
            addDialogClosed(){
                this.$refs.addFormRef.resetFields()
            },
            //点击按钮,天机数据
            addParams(){
                this.$refs.addFormRef.validate(async valid =>{
                    if(!valid) return
                    const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`,
                        {
                            attr_name: this.addForm.attr_name,
                            attr_sel: this.activeName
                        })

                    if(res.meta.status!==201){
                        return this.$message.error('添加参数s失败')
                    }
                    this.$message.success('添加参数成功')
                    this.addDialogVisible = false
                    this.getParamsData()
                })
            },
            editDialogClosed(){
                this.$refs.editFormRed.resetFields()
            }
        },
        computed:{
            isBtnDisabled(){
                if(this.selectedCateKeys.length!==3){
                    return true
                }
                return false
            },
           // 当前选中的三级分类id
            cateId(){
                if(this.selectedCateKeys.length===3){
                    return this.selectedCateKeys[2]
                }
                return  null
            },
            //动态计算标题文本
            titleText(){
                if(this.activeName === 'many'){
                    return '动态参数'
                }
                return '静态属性'
            }
        }
    }
</script>

<style lang="less" scoped>
.cat_opt{
    margin: 15px 0;
}
</style>