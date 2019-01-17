<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input :placeholder="$t('mindfulness.keyword')" v-model="listQuery.keyword" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('user.search') }}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">{{ $t('mindfulness.add') }}</el-button>
      <!--<el-checkbox-group v-model="statusFilter" class="filter-item" style="margin-left:15px;" @change="handleCheckStatusFilter">-->
      <!--<el-checkbox-->
      <!--v-for="(value,index) in statusMap"-->
      <!--:key="index"-->
      <!--:label="index">{{ value }}</el-checkbox>-->
      <!--</el-checkbox-group>-->
    </div>

    <el-table v-loading="listLoading" ref="dataTable" :data="mindfulnessList" border fit highlight-current-row style="width: 100%;">
      <el-table-column :label="$t('mindfulness.id')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('mindfulness.name')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('mindfulness.description')" align="center">
        <template slot-scope="scope">
          <el-popover
            :content="scope.row.description"
            :title="('table.description')"
            placement="top"
            trigger="hover">
            <span slot="reference">{{ scope.row.description.substring(0,20) }}</span>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column :label="$t('mindfulness.background')" align="center">
        <template slot-scope="scope">
          <a href="https://developer.mozilla.org/"><img :src="scope.row.background[0]" style="width: auto; height: auto; max-width: 100%; max-height: 100%;"></a>
        </template>
      </el-table-column>
      <el-table-column :label="$t('mindfulness.price')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.price }}</span>
          <!--<el-tag v-for="pid in scope.row.price" :key="pid">{{ pid }}</el-tag>-->
        </template>
      </el-table-column>
      <el-table-column :label="$t('mindfulness.scenes')" align="center">
        <template slot-scope="scope">
          <el-tag v-for="scene in scope.row.scenes" :key="scene">{{ sceneMap[scene].name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('mindfulness.audio')" align="center">
        <template slot-scope="scope">
          <audio :src="scope.row.audio" controls="controls"/>
        </template>
      </el-table-column>
      <el-table-column :label="$t('mindfulness.natureId')" align="center">
        <template slot-scope="scope">
          <el-tag>{{ natureMap[scope.row.natureId]?natureMap[scope.row.natureId].name:scope.row.natureId }}</el-tag>
          <!--<a :href="'user/natureInfo?natureId='+scope.row.natureId" target="_blank">{{ natureMap[scope.row.natureId]?natureMap[scope.row.natureId].name:scope.row.natureId }}</a>-->
          <!--<a href="index.vue">{{ userMap[scope.row.author]?userMap[scope.row.author].nickname:scope.row.author }}</a>-->
        </template>
      </el-table-column>
      <el-table-column :label="$t('mindfulness.author')" align="center">
        <template slot-scope="scope">
          <a :href="'user/userInfo?userId='+scope.row.author" target="_blank">{{ userMap[scope.row.author]?userMap[scope.row.author].nickname:scope.row.author }}</a>
          <!--<a href="index.vue">{{ userMap[scope.row.author]?userMap[scope.row.author].nickname:scope.row.author }}</a>-->
        </template>
      </el-table-column>
      <el-table-column :label="$t('mindfulness.copy')" align="center">
        <template slot-scope="scope">
          <el-popover
            :content="scope.row.copy"
            :title="('table.copy')"
            placement="top"
            trigger="hover">
            <span slot="reference">{{ scope.row.copy.substring(0,20) }}</span>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column :label="$t('mindfulness.mindfulnessAlbums')" align="center">
        <template slot-scope="scope">
          <el-tag v-for="mindfulnessAlbum in scope.row.mindfulnessAlbums" :key="mindfulnessAlbum">{{ mindfulnessAlbumMap[mindfulnessAlbum].name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('mindfulness.status')" align="center">
        <template slot-scope="scope">
          <!--<span>{{ scope.row.status }}</span>-->
          <template v-for="(value,index) in scope.row.status.toString(2).split('').reverse().map((x) => x==='1')">
            <el-tag v-if="value" :key="index" type="success">{{ statusMap[index] }}</el-tag>
          </template>
        </template>
      </el-table-column>
      <el-table-column :label="$t('mindfulness.updateTime')" align="center">
        <template slot-scope="scope">
          <span>{{ new Date(scope.row.updateTime*1000) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('mindfulness.validTime')" align="center">
        <template slot-scope="scope">
          <span>{{ new Date(scope.row.validTime*1000) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('mindfulness.actions')" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="small" icon="el-icon-edit" @click="handleUpdate(scope.row)">Edit</el-button>
          <!--<el-button v-if="scope.row.status&0b1" type="info" size="small" icon="el-icon-delete" @click="handleRevertDeleted(scope.row)">revert</el-button>-->
          <!--<el-button v-else type="danger" size="small" icon="el-icon-delete" @click="handleDelete(scope.row)">delete</el-button>-->
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item :label="$t('mindfulness.name')" prop="name">
          <el-input v-model="temp.name"/>
        </el-form-item>
        <el-form-item :label="$t('mindfulness.description')" prop="description">
          <el-input
            :autosize="{ minRows: 2, maxRows: 4}"
            v-model="temp.description"
            type="textarea"
            placeholder="请输入内容"/>
        </el-form-item>
        <el-form-item :label="$t('mindfulness.background')" prop="background">
          <el-upload
            :on-success="handleBackgroundSuccess"
            :before-upload="beforeBackgroundUpload"
            :before-remove="beforeBackgroundRemove"
            :on-remove="handleBackgroundRemove"
            :file-list="tempBackgroundFileList"
            :action="uploadBackgroundAPI"
            accept="image/*"
            list-type="picture">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传图像文件，且不超过20M</div>
          </el-upload>
        </el-form-item>
        <!--<el-form-item-->
        <!--v-for="(item, index) in temp.productId"-->
        <!--:label="$t('mindfulness.productId')"-->
        <!--:key="'productId.' + index"-->
        <!--prop="productId">-->
        <!--<el-input v-model="item.value"/>-->
        <!--<el-button @click.prevent="removeProductId(item)">删除</el-button>-->
        <!--</el-form-item>-->
        <!--<el-form-item>-->
        <!--<el-button @click="addProductId">新增productId</el-button>-->
        <!--</el-form-item>-->
        <el-form-item :label="$t('mindfulness.price')" prop="name">
          <el-input v-model="temp.price"/>
        </el-form-item>
        <el-form-item :label="$t('mindfulness.scenes')" prop="scenes">
          <el-checkbox-group v-model="temp.scenes">
            <el-checkbox
              v-for="(sceneOption) in sceneOptions"
              :key="sceneOption.id"
              :label="sceneOption.id">{{ sceneOption.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="$t('mindfulness.status')" prop="status">
          <el-checkbox-group v-model="tempStatus">
            <el-checkbox
              v-for="(value,index) in statusMap"
              :key="index"
              :label="index">{{ value }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="$t('mindfulness.mindfulnessAlbums')" prop="mindfulnessAlbums">
          <el-checkbox-group v-model="temp.mindfulnessAlbums">
            <el-checkbox
              v-for="(mindfulnessAlbumOption) in mindfulnessAlbumOptions"
              :key="mindfulnessAlbumOption.id"
              :label="mindfulnessAlbumOption.id">{{ mindfulnessAlbumOption.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="$t('mindfulness.audio')" prop="audio">
          <el-upload
            :on-success="handleAudioSuccess"
            :before-upload="beforeAudioUpload"
            :before-remove="beforeAudioRemove"
            :on-remove="handleAudioRemove"
            :on-exceed="handleAudioExceed"
            :limit="1"
            :file-list="tempAudioFileList"
            :action="uploadAudioAPI"
            accept="audio/*"
            list-type="text">
            <el-button size="small" type="primary">点击上传</el-button>
            <!--<div slot="tip" class="el-upload__tip">只能上传音频文件，且不超过20M</div>-->
          </el-upload>
        </el-form-item>
        <el-form-item v-show="false" :label="$t('mindfulness.author')" prop="author">
          <el-input v-model="temp.author"/>
        </el-form-item>
        <el-form-item :label="$t('mindfulness.copy')" prop="copy">
          <el-input
            :autosize="{ minRows: 2, maxRows: 4}"
            v-model="temp.copy"
            type="textarea"
            placeholder="请输入内容"/>
        </el-form-item>
        <el-form-item :label="$t('mindfulness.validTime')" prop="validTime">
          <el-date-picker v-model="temp.validTime" type="datetime" value-format="timestamp" placeholder="Please pick a date"/>
        </el-form-item>
        <el-form-item :label="$t('mindfulness.natureId')" prop="natureId">
          <el-select
            v-model="temp.natureId"
            :remote-method="remoteMethod"
            :loading="natureOptionsLoading"
            clearable
            filterable
            remote
            placeholder="请输入关键词">
            <el-option
              v-for="nature in natureOptions"
              :key="nature.id"
              :label="nature.name"
              :value="nature.id"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('mindfulness.cancel') }}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{ $t('mindfulness.confirm') }}</el-button>
        <el-button v-else type="primary" @click="updateData">{{ $t('mindfulness.confirm') }}</el-button>
      </div>
    </el-dialog>

    <div class="pagination-container">
      <el-pagination v-show="total>0" :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" :total="total" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>
  </div>
</template>

<script>
/* eslint-disable arrow-spacing */

// import * as OSS from 'ali-oss'
import * as _ from 'lodash'
import MINDFULNESS_SEARCH from '@/graphqls/mindfulnessSearch.graphql'
import NATURE_SEARCH from '@/graphqls/natureSearch.graphql'
import SCENE_ALL from '@/graphqls/sceneAll.graphql'
import MINDFULNESS_ALBUM_ALL from '@/graphqls/mindfulnessAlbumAll.graphql'
import MINDFULNESS_ALBUM_BY_ID from '@/graphqls/mindfulnessAlbumById.graphql'
import NATURE_BY_ID from '@/graphqls/natureById.graphql'
import MINDFULNESS_UPDATE from '@/graphqls/mindfulnessUpdate.graphql'
import MINDFULNESS_DELETE from '@/graphqls/mindfulnessDelete.graphql'
import MINDFULNESS_REVERT_DELETED from '@/graphqls/mindfulnessRevertDeleted.graphql'
import MINDFULNESS_CREATE from '@/graphqls/mindfulnessCreate.graphql'
import USER_BY_ID from '@/graphqls/userById.graphql'

export default {
  name: 'MindfulnessTable',
  data() {
    return {
      statusMap: ['已删除', '标志位2', '标志位3'],
      statusFilter: [],
      sceneMap: {},
      sceneOptions: [],
      userMap: {},
      mindfulnessAlbumOptions: [],
      mindfulnessAlbumMap: {},
      natureMap: {},
      natureOptions: [],
      natureOptionsLoading: true,
      uploadBackgroundAPI: process.env.BASE_API + '/uploadBackground/',
      uploadAudioAPI: process.env.BASE_API + '/uploadBackground/',
      mindfulnessList: [
      ],
      listLoading: true,
      temp: { scenes: [], validTime: 0, mindfulnessAlbums: [] },
      tempStatus: [],
      tempAudioFileList: [],
      tempBackgroundFileList: [],
      dialogStatus: 'create',
      dialogFormVisible: false,
      total: null,
      listQuery: {
        page: 1,
        limit: 20,
        keyword: ''
      }
    }
  },
  async created() {
    await this.getScene()
    await this.getMindfulnessAlbumAll()
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
    //   this.temp.productId.push({ value: '' })
    // },
    async handleCheckStatusFilter(value) {
      // console.log(value)
      // console.log(value.reduce((accumulator, currentValue) => accumulator | (1 << currentValue), 0))
      await this.getList(value.reduce((accumulator, currentValue) => accumulator | (1 << currentValue), 0))
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
    beforeAudioUpload(file) {
      return true
      // const isLt20M = file.size / 1024 / 1024 < 20
      //
      // if (!isLt20M) {
      //   this.$message.error('上传头像图片大小不能超过 20MB!')
      // }
      // return isLt20M
    },
    handleAudioSuccess(res, file, fileList) {
      console.log(fileList[fileList.length - 1].response.data)
      this.temp.audio = fileList[fileList.length - 1].response.data
    },
    handleAudioRemove() {
      this.temp.audio = ''
    },
    handleAudioExceed(files, fileList) {
      this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    beforeAudioRemove(file) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    async remoteMethod(keyword) {
      console.log(keyword)
      if (keyword !== '') {
        this.natureOptionsLoading = true
        // setTimeout(() => {
        //   this.resourceOptionsLoading = false
        //   this.resourceOptions = [{ 'id': '南拳妈妈龙虾盖浇饭', 'name': '普陀区金沙江路1699号鑫乐惠美食广场A13' }]
        // }, 200)

        const result = await this.$apollo.query({
          // 查询语句
          query: NATURE_SEARCH,
          // 参数
          variables: {
            keyword: keyword,
            page: 1,
            limit: 10
          }
        })
        this.natureOptions = result.data.searchNature.data.data
        this.natureOptionsLoading = false
      } else {
        this.natureOptions = []
        this.natureOptionsLoading = false
      }
    },
    async getScene() {
      const result = await this.$apollo.query({ query: SCENE_ALL })
      this.sceneOptions = result.data.getScene.data
      result.data.getScene.data.forEach((scene) => {
        this.sceneMap[scene.id] = scene
      })
    },
    async getMindfulnessAlbumAll() {
      const result = await this.$apollo.query({ query: MINDFULNESS_ALBUM_ALL, variables: { status: 0 }})
      this.mindfulnessAlbumOptions = result.data.getMindfulnessAlbum.data
      result.data.getMindfulnessAlbum.data.forEach((mindfulnessAlbum) => {
        this.mindfulnessAlbumMap[mindfulnessAlbum.id] = mindfulnessAlbum
      })
    },
    async getMindfulnessAlbum(mindfulnessAlbumId) {
      const result = await this.$apollo.query({
        // 查询语句
        query: MINDFULNESS_ALBUM_BY_ID,
        // 参数
        variables: {
          id: mindfulnessAlbumId
        }
      })
      this.mindfulnessAlbumMap[mindfulnessAlbumId] = result.data.getMindfulnessAlbumById.data
    },
    async getNature(natureId) {
      const result = await this.$apollo.query({
        // 查询语句
        query: NATURE_BY_ID,
        // 参数
        variables: {
          id: natureId
        }
      })
      this.natureMap[natureId] = result.data.getNatureById.data
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
    },
    async getList(status = 0) {
      this.listLoading = true
      const result = await this.$apollo.query({
        // 查询语句
        query: MINDFULNESS_SEARCH,
        // 参数
        variables: {
          page: this.listQuery.page,
          limit: this.listQuery.limit,
          keyword: this.listQuery.keyword || '*'
        },
        fetchPolicy: 'network-only' // 只从网络获取
      })
      const promises = result.data.searchMindfulness.data.data.map((mindfulness) => {
        return this.getUser(mindfulness.author)
      })
      const userPromises = []
      const albumPromises = []
      const naturePromises = []
      result.data.searchMindfulness.data.data.forEach((mindfulness) => {
        userPromises.push(this.getUser(mindfulness.author))
        mindfulness.mindfulnessAlbums.forEach((mindfulnessAlbumId) => {
          if (!this.mindfulnessAlbumMap[mindfulnessAlbumId]) {
            albumPromises.push(this.getMindfulnessAlbum(mindfulnessAlbumId))
          }
        })
        naturePromises.push(this.getNature(mindfulness.natureId))
      })
      // console.log(result)
      await Promise.all(promises)
      await Promise.all(albumPromises)
      await Promise.all(naturePromises)
      this.mindfulnessList = result.data.searchMindfulness.data.data
      this.total = result.data.searchMindfulness.data.total
      this.listLoading = false
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    resetTemp() {
      this.temp = {
        scenes: [],
        mindfulnessAlbums: []
        // productId: []
      }
      this.tempStatus = []
      // this.tempStatus.forEach((status, index) => {
      //   this.tempStatus[index] = 0
      // })
      this.tempAudioFileList = []
      this.tempBackgroundFileList = []
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    async createData() {
      this.temp.author = this.$store.getters.id
      this.temp.price = parseInt(this.temp.price) || 0
      this.temp.validTime = Math.floor(this.temp.validTime / 1000)
      this.temp.status = this.tempStatus.reduce((accumulator, currentValue) => accumulator | (1 << currentValue), 0)
      // this.temp.productId = this.temp.productId.map((pidValue) => pidValue.value)
      const data = await this.$apollo.mutate({
        // 查询语句
        mutation: MINDFULNESS_CREATE,
        // 参数
        variables: {
          createData: this.temp
        }
      })

      console.log('getList')
      await this.getList()

      if (data.data.createMindfulness.code !== 200) {
        this.$notify({
          title: '失败',
          message: data.data.createMindfulness.message,
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
      this.natureOptions = [{ id: row.natureId, name: _.get(this.natureMap, [row.natureId, 'name'], '') }]
      this.tempStatus = this.temp.status.toString(2).split('').reverse().map((value, index) => value === '1' ? index : undefined).filter(val => val !== undefined)
      // this.temp.productId = this.temp.productId.map((pid)=>{ return { value: pid } })
      this.tempBackgroundFileList = row.background ? row.background.map(x => ({ url: x })) : []
      this.tempAudioFileList = row.audio ? [{ url: row.audio }] : []
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
        mutation: MINDFULNESS_UPDATE,
        // 参数
        variables: {
          id: this.temp.id,
          updateData: {
            background: this.temp.background,
            name: this.temp.name,
            description: this.temp.description,
            scenes: this.temp.scenes,
            // productId: this.temp.productId.map((pidValue) => pidValue.value),
            price: parseInt(this.temp.price) || 0,
            author: this.$store.getters.id,
            audio: this.temp.audio,
            copy: this.temp.copy,
            mindfulnessAlbums: this.temp.mindfulnessAlbums,
            status: this.tempStatus.reduce((accumulator, currentValue) => accumulator | (1 << currentValue), 0),
            validTime: Math.floor(this.temp.validTime / 1000),
            natureId: this.temp.natureId
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
        mutation: MINDFULNESS_DELETE,
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
    },
    async handleRevertDeleted(row) {
      this.listLoading = true
      await this.$apollo.mutate({
        // 查询语句
        mutation: MINDFULNESS_REVERT_DELETED,
        // 参数
        variables: {
          id: row.id
        }
      })
      await this.getList()
      this.listLoading = false
      this.$notify({
        title: '成功',
        message: '恢复成功',
        type: 'success',
        duration: 2000
      })
    }
  }
}
</script>
