<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">{{ $t('home.add') }}</el-button>
    </div>

    <el-table v-loading="listLoading" ref="dataTable" :data="homeList" border fit highlight-current-row style="width: 100%;">
      <el-table-column type="expand" >
        <template slot-scope="scope" >
          <el-form v-if="scope.row.resourceId!=='000000000000000000000000'" label-position="left" inline class="demo-table-expand">
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
          <el-form v-else label-position="left" inline class="demo-table-expand">
            <el-form-item label="资源id">
              <span>{{ scope.row.resourceId }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column :label="$t('home.id')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('home.type')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="false" :label="$t('home.resourceId')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.resourceId }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('home.name')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('home.description')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('home.background')" align="center">
        <template slot-scope="scope">
          <a href="https://developer.mozilla.org/"><img :src="scope.row.background[0]" style="width: auto; height: auto; max-width: 100%; max-height: 100%;"></a>
        </template>
      </el-table-column>
      <el-table-column :label="$t('home.author')" align="center">
        <template slot-scope="scope">
          <a :href="'user/userInfo?userId='+scope.row.author" target="_blank">{{ userMap[scope.row.author]?userMap[scope.row.author].nickname:scope.row.author }}</a>
          <!--<a href="index.vue">{{ userMap[scope.row.author]?userMap[scope.row.author].nickname:scope.row.author }}</a>-->
        </template>
      </el-table-column>
      <el-table-column :label="$t('home.position')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.position }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('home.createTime')" align="center">
        <template slot-scope="scope">
          <span>{{ new Date(scope.row.createTime*1000) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('home.updateTime')" align="center">
        <template slot-scope="scope">
          <span>{{ new Date(scope.row.updateTime*1000) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('home.validTime')" align="center">
        <template slot-scope="scope">
          <span>{{ new Date(scope.row.validTime*1000) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('home.actions')" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="small" icon="el-icon-edit" @click="handleUpdate(scope.row)">Edit</el-button>
          <!--<el-button v-if="scope.row.status&0b1" type="info" size="small" icon="el-icon-delete" @click="handleRevertDeleted(scope.row)">revert</el-button>-->
          <!--<el-button v-else type="danger" size="small" icon="el-icon-delete" @click="handleDelete(scope.row)">delete</el-button>-->
          <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete(scope.row)">delete</el-button>
        </template>
      </el-table-column>
      <el-table-column v-if="false" align="center" label="Drag" width="80">
        <template slot-scope="scope">
          <svg-icon class="drag-handler" icon-class="drag"/>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="false" class="show-d">{{ $t('home.dragTips1') }} : {{ oldList }}</div>
    <div v-if="false" class="show-d">{{ $t('home.dragTips2') }} : {{ newList }}</div>

    <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item :label="$t('home.name')" prop="name">
          <el-input v-model="temp.name"/>
        </el-form-item>
        <el-form-item :label="$t('home.description')" prop="description">
          <el-input
            :autosize="{ minRows: 2, maxRows: 4}"
            v-model="temp.description"
            type="textarea"
            placeholder="请输入内容"/>
        </el-form-item>
        <el-form-item :label="$t('home.type')" prop="type">
          <el-select v-model="temp.type" placeholder="请选择" @change="clearResource">
            <el-option v-for="item in homeOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('home.resourceId')" prop="resourceId">
          <el-select
            v-model="temp.resourceId"
            :remote-method="remoteMethod"
            :loading="resourceOptionsLoading"
            clearable
            filterable
            remote
            placeholder="请输入关键词">
            <el-option
              v-for="resource in resourceOptions"
              :key="resource.id"
              :label="resource.name"
              :value="resource.id"/>
          </el-select>
        </el-form-item>
        <el-cascader
          v-if="false"
          v-model="temp.typeAndResourceId"
          :options="resourceOptions"
          :props="props"
          :before-filter="beforeFilter"
          filterable
          @active-item-change="handleItemChange"/>
        <el-form-item :label="$t('home.background')" prop="background">
          <el-upload
            :on-success="handleBackgroundSuccess"
            :before-upload="beforeBackgroundUpload"
            :before-remove="beforeBackgroundRemove"
            :on-remove="handleBackgroundRemove"
            :file-list="tempBackgroundFileList"
            :action="uploadAPI"
            accept="image/*"
            list-type="picture">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传图像文件，且不超过20M</div>
          </el-upload>
        </el-form-item>
        <!--<el-form-item-->
        <!--v-for="(item, index) in temp.productId"-->
        <!--:label="$t('home.productId')"-->
        <!--:key="'productId.' + index"-->
        <!--prop="productId">-->
        <!--<el-input v-model="item.value"/>-->
        <!--<el-button @click.prevent="removeProductId(item)">删除</el-button>-->
        <!--</el-form-item>-->
        <!--<el-form-item>-->
        <!--<el-button @click="addProductId">新增productId</el-button>-->
        <!--</el-form-item>-->
        <el-form-item v-show="false" :label="$t('home.author')" prop="author">
          <el-input v-model="temp.author"/>
        </el-form-item>
        <el-form-item :label="$t('home.position')" prop="author">
          <el-input-number v-model="temp.position" :min="0" :max="10"/>
        </el-form-item>
        <el-form-item :label="$t('home.validTime')" prop="validTime">
          <el-date-picker v-model="temp.validTime" type="datetime" value-format="timestamp" placeholder="Please pick a date"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('home.cancel') }}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{ $t('home.confirm') }}</el-button>
        <el-button v-else type="primary" @click="updateData">{{ $t('home.update') }}</el-button>
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
  .sortable-ghost{
    opacity: .8;
    color: #fff!important;
    background: #42b983!important;
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
import MINDFULNESS_SEARCH from '@/graphqls/mindfulnessSearch.graphql'
import NATURE_SEARCH from '@/graphqls/natureSearch.graphql'
import WANDER_SEARCH from '@/graphqls/wanderSearch.graphql'
import WANDER_ALBUM_SEARCH from '@/graphqls/wanderAlbumSearch.graphql'
// import Sortable from 'sortablejs'

export default {
  name: 'HomeTable',
  data() {
    return {
      homeOptions: [
        { key: 'mindfulness', display_name: '正念' },
        { key: 'nature', display_name: '自然' },
        { key: 'wander', display_name: '漫步' },
        { key: 'wanderAlbum', display_name: '漫步专辑' },
        { key: 'shop', display_name: '商城(暂不支持)' }
      ],
      uploadAPI: process.env.BASE_API + '/uploadBackground/',
      sceneMap: {},
      userMap: {},
      resourceMap: {},
      resourceOptions: [],
      props: {
        value: 'id',
        label: 'name'
      },
      homeList: [],
      sortable: null,
      oldList: [],
      newList: [],
      listLoading: true,
      resourceOptionsLoading: true,
      temp: { resourceId: '', position: 0, validTime: 0 },
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
    // setSort() {
    //   const el = document.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
    //   this.sortable = Sortable.create(el, {
    //     ghostClass: 'sortable-ghost', // Class name for the drop placeholder,
    //     setData: function(dataTransfer) {
    //       dataTransfer.setData('Text', '')
    //       // to avoid Firefox bug
    //       // Detail see : https://github.com/RubaXa/Sortable/issues/1012
    //     },
    //     onEnd: evt => {
    //       const targetRow = this.homeList.splice(evt.oldIndex, 1)[0]
    //       this.homeList.splice(evt.newIndex, 0, targetRow)
    //
    //       // for show the changes, you can delete in you code
    //       const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
    //       this.newList.splice(evt.newIndex, 0, tempIndex)
    //     }
    //   })
    // },
    // beforeFilter(val) {
    //   console.log(val)
    // },
    // handleItemChange(val) {
    //   console.log('active item:', val)
    //   setTimeout(_ => {
    //     if (val.indexOf('mindfulness') > -1 && !this.resourceOptions[0].children.length) {
    //       this.resourceOptions[0].children = [{
    //         id: 'najing',
    //         name: '南京'
    //       }]
    //     } else if (val.indexOf('nature') > -1 && !this.resourceOptions[1].children.length) {
    //       this.resourceOptions[1].children = [{
    //         id: 'hangzhou',
    //         name: '杭州'
    //       }]
    //     }
    //   }, 300)
    // },
    clearResource() {
      console.log(11111)
      this.temp.resourceId = null
      // this.resourceId = null
    },
    async remoteMethod(keyword) {
      console.log(keyword)
      if (keyword !== '') {
        this.resourceOptionsLoading = true
        let query
        let resultField
        if (this.temp.type === 'mindfulness') {
          query = MINDFULNESS_SEARCH
          resultField = 'searchMindfulness'
        } else if (this.temp.type === 'nature') {
          query = NATURE_SEARCH
          resultField = 'searchNature'
        } else if (this.temp.type === 'wander') {
          query = WANDER_SEARCH
          resultField = 'searchWander'
        } else if (this.temp.type === 'wanderAlbum') {
          query = WANDER_ALBUM_SEARCH
          resultField = 'searchWanderAlbum'
        } else {
          this.resourceOptions = []
          this.resourceOptionsLoading = false
          return
        }
        // setTimeout(() => {
        //   this.resourceOptionsLoading = false
        //   this.resourceOptions = [{ 'id': '南拳妈妈龙虾盖浇饭', 'name': '普陀区金沙江路1699号鑫乐惠美食广场A13' }]
        // }, 200)

        const result = await this.$apollo.query({
          // 查询语句
          query: query,
          // 参数
          variables: {
            keyword: keyword,
            from: 0,
            size: 10
          }
        })
        this.resourceOptions = result.data[resultField].data.data
        this.resourceOptionsLoading = false
      } else {
        this.resourceOptions = []
        this.resourceOptionsLoading = false
      }
    },
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
      const backgrounds = []
      fileList.forEach((fileItem) => {
        if (fileItem.response) {
          backgrounds.push(fileItem.response.data)
        } else {
          backgrounds.push(fileItem.url)
        }
      })
      this.temp.background = backgrounds
    },
    handleBackgroundRemove(file, fileList) {
      const backgrounds = []
      fileList.forEach((fileItem) => {
        if (fileItem.response) {
          backgrounds.push(fileItem.response.data)
        } else {
          backgrounds.push(fileItem.url)
        }
      })
      this.temp.background = backgrounds
    },
    // handleBackgroundExceed(files, fileList) {
    //   this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    // },
    beforeBackgroundRemove(file) {
      return this.$confirm(`确定移除图片？`)
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
      this.userMap[userId] = result.data.getUserById.data
      console.log(this.userMap)
    },
    async getResource(type, resourceId) {
      if (resourceId === '000000000000000000000000') {
        return
      }
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
      } else {
        this.resourceOptions = []
        return
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
      // const index = _.findIndex(this.resourceOptions, { id: type })
      // this.resourceOptions[index].children.push({ id: resourceId, name: this.resourceMap[resourceId].name })
      // console.log(this.resourceOptions)
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
      // this.$nextTick(() => {
      //   this.setSort()
      // })
    },
    resetTemp() {
      this.temp = { resourceId: '', position: 0 }
      this.tempAudioFileList = []
      this.tempBackgroundFileList = []
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    async createData() {
      // this.temp.type = this.temp.typeAndResourceId[0]
      // this.temp.resourceId = this.temp.typeAndResourceId[1]
      this.temp.author = this.$store.getters.id
      console.log(this.temp)
      if (this.temp.type === 'shop') {
        this.temp.resourceId = '000000000000000000000000'
      }
      if (!this.temp.resourceId) {
        this.temp.resourceId = '000000000000000000000000'
      }
      // this.temp.productId = this.temp.productId.map((pidValue) => pidValue.value)
      const data = await this.$apollo.mutate({
        // 查询语句
        mutation: HOME_CREATE,
        // 参数
        variables: {
          createData: {
            type: this.temp.type,
            resourceId: this.temp.resourceId,
            background: this.temp.background,
            name: this.temp.name,
            description: this.temp.description,
            author: this.temp.author,
            position: this.temp.position,
            validTime: Math.floor(this.temp.validTime / 1000)
          }
        }
      })

      console.log('getList')
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
      this.temp.validTime = this.temp.validTime * 1000
      this.resourceOptions = [{ id: row.resourceId, name: _.get(this.resourceMap, [row.resourceId, name], '') }]
      // this.temp.productId = this.temp.productId.map((pid)=>{ return { value: pid } })
      this.tempBackgroundFileList = row.background ? row.background.map(x => ({ url: x })) : []
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    async updateData() {
      // this.temp = _.cloneDeep(this.temp)
      this.temp.author = this.$store.getters.id
      // this.temp.productId = this.temp.productId.map((pidValue) => pidValue.value)
      // console.log(this.temp)
      console.log(this.temp)
      if (this.temp.type === 'shop') {
        this.temp.resourceId = '000000000000000000000000'
      }
      if (!this.temp.resourceId) {
        this.temp.resourceId = '000000000000000000000000'
      }
      await this.$apollo.mutate({
        // 查询语句
        mutation: HOME_UPDATE,
        // 参数
        variables: {
          id: this.temp.id,
          updateData: {
            type: this.temp.type,
            resourceId: this.temp.resourceId,
            background: this.temp.background,
            name: this.temp.name,
            description: this.temp.description,
            author: this.temp.author,
            position: this.temp.position,
            validTime: Math.floor(this.temp.validTime / 1000)
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
