<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">Add</el-button>
    </div>

    <el-table v-loading="listLoading" ref="dataTable" :data="homeList" border fit highlight-current-row style="width: 100%;">
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="资源id">
              <span>{{ scope.row.resourceId }}</span>
            </el-form-item>
            <el-form-item label="资源名称">
              <span>{{ resourceMap[scope.row.resourceId].name }}</span>
            </el-form-item>
            <el-form-item label="资源描述">
              <span>{{ resourceMap[scope.row.resourceId].description }}</span>
            </el-form-item>
            <el-form-item label="价格">
              <span>{{ resourceMap[scope.row.resourceId].price }}</span>
            </el-form-item>
            <el-form-item label="适用场景">
              <el-tag v-for="scene in resourceMap[scope.row.resourceId].scenes" :key="scene">{{ sceneMap[scene].name }}</el-tag>
            </el-form-item>
            <el-form-item label="作者">
              <a :href="'user/userInfo?userId='+resourceMap[scope.row.resourceId].author" target="_blank">{{ userMap[resourceMap[scope.row.resourceId].author]?userMap[resourceMap[scope.row.resourceId].author].nickname:resourceMap[scope.row.resourceId].author }}</a>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.id')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.type')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="false" :label="$t('table.resourceId')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.resourceId }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.name')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.description')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.background')" align="center">
        <template slot-scope="scope">
          <a href="https://developer.mozilla.org/"><img :src="scope.row.background" style="width: auto; height: auto; max-width: 100%; max-height: 100%;"></a>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.author')" align="center">
        <template slot-scope="scope">
          <a :href="'user/userInfo?userId='+scope.row.author" target="_blank">{{ userMap[scope.row.author]?userMap[scope.row.author].nickname:scope.row.author }}</a>
          <!--<a href="index.vue">{{ userMap[scope.row.author]?userMap[scope.row.author].nickname:scope.row.author }}</a>-->
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.createTime')" align="center">
        <template slot-scope="scope">
          <span>{{ new Date(scope.row.createTime*1000) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.updateTime')" align="center">
        <template slot-scope="scope">
          <span>{{ new Date(scope.row.updateTime*1000) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="small" icon="el-icon-edit" @click="handleUpdate(scope.row)">Edit</el-button>
          <!--<el-button v-if="scope.row.status&0b1" type="info" size="small" icon="el-icon-delete" @click="handleRevertDeleted(scope.row)">revert</el-button>-->
          <!--<el-button v-else type="danger" size="small" icon="el-icon-delete" @click="handleDelete(scope.row)">delete</el-button>-->
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item :label="$t('table.name')" prop="name">
          <el-input v-model="temp.name"/>
        </el-form-item>
        <el-form-item :label="$t('table.description')" prop="description">
          <el-input
            :autosize="{ minRows: 2, maxRows: 4}"
            v-model="temp.description"
            type="textarea"
            placeholder="请输入内容"/>
        </el-form-item>
        <el-form-item :label="$t('table.background')" prop="background">
          <el-upload
            :on-success="handleBackgroundSuccess"
            :before-upload="beforeBackgroundUpload"
            :before-remove="beforeBackgroundRemove"
            :on-remove="handleBackgroundRemove"
            :on-exceed="handleBackgroundExceed"
            :limit="1"
            :file-list="tempBackgroundFileList"
            accept="image/*"
            list-type="picture"
            action="http://localhost:5000/uploadBackground/">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传图像文件，且不超过20M</div>
          </el-upload>
        </el-form-item>
        <!--<el-form-item-->
        <!--v-for="(item, index) in temp.productId"-->
        <!--:label="$t('table.productId')"-->
        <!--:key="'productId.' + index"-->
        <!--prop="productId">-->
        <!--<el-input v-model="item.value"/>-->
        <!--<el-button @click.prevent="removeProductId(item)">删除</el-button>-->
        <!--</el-form-item>-->
        <!--<el-form-item>-->
        <!--<el-button @click="addProductId">新增productId</el-button>-->
        <!--</el-form-item>-->
        <el-form-item :label="$t('table.price')" prop="name">
          <el-input v-model="temp.price"/>
        </el-form-item>
        <el-form-item v-show="false" :label="$t('table.author')" prop="author">
          <el-input v-model="temp.author"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{ $t('table.confirm') }}</el-button>
        <el-button v-else type="primary" @click="updateData">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<style>
  .demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>

<script>
/* eslint-disable arrow-spacing */

// import * as OSS from 'ali-oss'
import * as _ from 'lodash'
import HOME_ALL from '@/graphqls/homeAll.graphql'
import HOME_UPDATE from '@/graphqls/homeUpdate.graphql'
import HOME_DELETE from '@/graphqls/homeDelete.graphql'
import HOME_CREATE from '@/graphqls/homeCreate.graphql'
import USER_BY_ID from '@/graphqls/userById.graphql'
import SCENE_ALL from '@/graphqls/sceneAll.graphql'
import MINDFULNESS_BY_ID from '@/graphqls/mindfulnessById.graphql'
import NATURE_BY_ID from '@/graphqls/natureById.graphql'
import WANDER_BY_ID from '@/graphqls/wanderById.graphql'
import WANDER_ALBUM_BY_ID from '@/graphqls/wanderAlbumById.graphql'

export default {
  name: 'HomeTable',
  data() {
    return {
      sceneMap: {},
      userMap: {},
      resourceMap: {},
      homeList: [],
      listLoading: true,
      temp: {},
      tempAudioFileList: [],
      tempBackgroundFileList: [],
      dialogStatus: 'create',
      dialogFormVisible: false
    }
  },
  async created() {
    await this.getScene()
    await this.getList()
  },
  methods: {
    // removeProductId(item) {
    //   const index = this.temp.productId.indexOf(item)
    //   if (index !== -1) {
    //     this.temp.productId.splice(index, 1)
    //   }
    // },
    // addProductId() {
    //   this.temp.productId.push({ value: '' })f
    // },
    async getScene() {
      const result = await this.$apollo.query({ query: SCENE_ALL })
      result.data.getScene.data.forEach((scene) => {
        this.sceneMap[scene.id] = scene
      })
    },
    beforeBackgroundUpload(file) {
      const isLt20M = file.size / 1024 / 1024 < 20
      if (!isLt20M) {
        this.$message.error('上传头像图片大小不能超过 20MB!')
      }
      return isLt20M
    },
    handleBackgroundSuccess(res, file, fileList) {
      this.temp.background = fileList[fileList.length - 1].response.data
    },
    handleBackgroundRemove() {
      this.temp.background = ''
    },
    handleBackgroundExceed(files, fileList) {
      this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    beforeBackgroundRemove(file) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    async getUser(userId) {
      const result = await this.$apollo.query({
        // 查询语句
        query: USER_BY_ID,
        // 参数
        variables: {
          id: userId
        }
      })
      console.log(result)
      this.userMap[userId] = result.data.getUserById.data
    },
    async getResource(type, resourceId) {
      let query
      let resultField
      if (type === 'mindfulness') {
        query = MINDFULNESS_BY_ID
        resultField = 'getMindfulnessById'
      } else if (type === 'nature') {
        query = NATURE_BY_ID
        resultField = 'getNatureById'
      } else if (type === 'wander') {
        query = WANDER_BY_ID
        resultField = 'getWanderById'
      } else if (type === 'wanderAlbum') {
        query = WANDER_ALBUM_BY_ID
        resultField = 'getWanderAlbumById'
      }
      const result = await this.$apollo.query({
        // 查询语句
        query: query,
        // 参数
        variables: {
          id: resourceId
        }
      })
      this.resourceMap[resourceId] = result.data[resultField].data
      await this.getUser(this.resourceMap[resourceId].author)
    },
    async getList() {
      this.listLoading = true
      const result = await this.$apollo.query({
        // 查询语句
        query: HOME_ALL,
        // 参数
        variables: {
          first: 20
        },
        fetchPolicy: 'network-only' // 只从网络获取
      })
      console.log(result.data)
      const getUserPromises = result.data.getHome.data.map((home) => {
        return this.getUser(home.author)
      })
      await Promise.all(getUserPromises)
      const getResourcePromises = result.data.getHome.data.map((home) => {
        return this.getResource(home.type, home.resourceId)
      })
      await Promise.all(getResourcePromises)
      console.log(this.userMap)
      console.log(this.resourceMap)
      this.homeList = result.data.getHome.data
      this.listLoading = false
    },
    resetTemp() {
      this.temp = {}
      this.tempAudioFileList = []
      this.tempBackgroundFileList = []
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    async createData() {
      console.log(this.temp)
      this.temp.author = this.$store.getters.id
      this.temp.price = parseInt(this.temp.price)
      // this.temp.productId = this.temp.productId.map((pidValue) => pidValue.value)
      const data = await this.$apollo.mutate({
        // 查询语句
        mutation: HOME_CREATE,
        // 参数
        variables: {
          createData: this.temp
        }
      })

      console.log('getList')
      // const result = await this.$apollo.query({
      //   // 查询语句
      //   query: HOME_ALL,
      //   // 参数
      //   variables: {
      //     first: 20
      //   },
      //   fetchPolicy: 'network-only' // 只从网络获取
      // })
      // this.homeList = result.data.getHome.data
      await this.getList()

      if (data.data.createHome.code !== 200) {
        this.$notify({
          title: '失败',
          message: data.data.createHome.message,
          type: 'error',
          duration: 2000
        })
      } else {
        // 结果
        this.dialogFormVisible = false
        this.$notify({
          title: '成功',
          message: '创建成功',
          type: 'success',
          duration: 2000
        })
      }
    },
    handleUpdate(row) {
      this.resetTemp()
      this.temp = _.cloneDeep(row)
      // this.temp.productId = this.temp.productId.map((pid)=>{ return { value: pid } })
      this.tempBackgroundFileList = row.background ? [{ url: row.background }] : []
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    async updateData() {
      // this.temp = _.cloneDeep(this.temp)
      // this.temp.author = this.$store.getters.id
      // this.temp.productId = this.temp.productId.map((pidValue) => pidValue.value)
      // console.log(this.temp)
      await this.$apollo.mutate({
        // 查询语句
        mutation: HOME_UPDATE,
        // 参数
        variables: {
          id: this.temp.id,
          updateData: {
            background: this.temp.background,
            name: this.temp.name,
            description: this.temp.description,
            // productId: this.temp.productId.map((pidValue) => pidValue.value),
            price: parseInt(this.temp.price),
            author: this.$store.getters.id,
            status: this.temp.status
          }
        }
      })

      await this.getList()
      this.listLoading = false
      this.dialogFormVisible = false
      this.$notify({
        title: '成功',
        message: '更新成功',
        type: 'success',
        duration: 2000
      })
    },
    async handleDelete(row) {
      this.listLoading = true
      await this.$apollo.mutate({
        // 查询语句
        mutation: HOME_DELETE,
        // 参数
        variables: {
          id: row.id
        }
      })
      await this.getList()
      this.listLoading = false
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
    }
  }
}
</script>
