<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">{{ $t('wander.add') }}</el-button>
      <el-checkbox-group v-model="statusFilter" class="filter-item" style="margin-left:15px;" @change="handleCheckStatusFilter">
        <el-checkbox
          v-for="(value,index) in statusMap"
          :key="index"
          :label="index">{{ value }}</el-checkbox>
      </el-checkbox-group>
    </div>

    <el-table v-loading="listLoading" ref="dataTable" :data="wanderList" border fit highlight-current-row style="width: 100%;">
      <el-table-column :label="$t('wander.id')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('wander.name')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('wander.description')" align="center">
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
      <el-table-column :label="$t('wander.background')" align="center">
        <template slot-scope="scope">
          <a href="https://developer.mozilla.org/"><img :src="scope.row.background[0]" style="width: auto; height: auto; max-width: 100%; max-height: 100%;"></a>
        </template>
      </el-table-column>
      <el-table-column :label="$t('wander.price')" align="center">
        <template slot-scope="scope">
          <!--<el-tag v-for="pid in scope.row.productId" :key="pid">{{ pid }}</el-tag>-->
          <span>{{ scope.row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('wander.scenes')" align="center">
        <template slot-scope="scope">
          <el-tag v-for="scene in scope.row.scenes" :key="scene">{{ sceneMap[scene].name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('wander.audio')" align="center">
        <template slot-scope="scope">
          <audio :src="scope.row.audio" controls="controls"/>
        </template>
      </el-table-column>
      <el-table-column :label="$t('wander.author')" align="center">
        <template slot-scope="scope">
          <a :href="'user/userInfo?userId='+scope.row.author" target="_blank">{{ userMap[scope.row.author]?userMap[scope.row.author].nickname:scope.row.author }}</a>
        </template>
      </el-table-column>
      <el-table-column :label="$t('wander.copy')" align="center">
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
      <el-table-column :label="$t('wander.wanderAlbums')" align="center">
        <template slot-scope="scope">
          <el-tag v-for="wanderAlbum in scope.row.wanderAlbums" :key="wanderAlbum">{{ wanderAlbumMap[wanderAlbum].name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('wander.status')" align="center">
        <template slot-scope="scope">
          <!--<span>{{ scope.row.status }}</span>-->
          <template v-for="(value,index) in scope.row.status.toString(2).split('').reverse().map((x) => x==='1')">
            <el-tag v-if="value" :key="index" type="success">{{ statusMap[index] }}</el-tag>
          </template>
        </template>
      </el-table-column>
      <el-table-column :label="$t('wander.updateTime')" align="center">
        <template slot-scope="scope">
          <span>{{ new Date(scope.row.updateTime*1000) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('wander.validTime')" align="center">
        <template slot-scope="scope">
          <span>{{ new Date(scope.row.validTime*1000) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('wander.actions')" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="small" icon="el-icon-edit" @click="handleUpdate(scope.row)">{{ $t('wander.edit') }}</el-button>
          <!--<el-button v-if="scope.row.status&0b1" type="info" size="small" icon="el-icon-delete" @click="handleRevertDeleted(scope.row)">{{ $t('wander.revert') }}</el-button>-->
          <!--<el-button v-else type="danger" size="small" icon="el-icon-delete" @click="handleDelete(scope.row)">{{ $t('wander.delete') }}</el-button>-->
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item :label="$t('wander.name')" prop="name">
          <el-input v-model="temp.name"/>
        </el-form-item>
        <el-form-item :label="$t('wander.description')" prop="description">
          <el-input
            :autosize="{ minRows: 2, maxRows: 4}"
            v-model="temp.description"
            type="textarea"
            placeholder="请输入内容"/>
        </el-form-item>
        <el-form-item :label="$t('wander.background')" prop="background">
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
        <!--:label="$t('wander.productId')"-->
        <!--:key="'productId.' + index"-->
        <!--prop="productId">-->
        <!--<el-input v-model="item.value"/>-->
        <!--<el-button @click.prevent="removeProductId(item)">删除</el-button>-->
        <!--</el-form-item>-->
        <!--<el-form-item>-->
        <!--<el-button @click="addProductId">新增productId</el-button>-->
        <!--</el-form-item>-->
        <el-form-item :label="$t('wander.price')" prop="name">
          <el-input v-model="temp.price"/>
        </el-form-item>
        <el-form-item :label="$t('wander.scenes')" prop="scenes">
          <el-checkbox-group v-model="temp.scenes">
            <el-checkbox
              v-for="(sceneOption) in sceneOptions"
              :key="sceneOption.id"
              :label="sceneOption.id">{{ sceneOption.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="$t('wander.status')" prop="status">
          <el-checkbox-group v-model="tempStatus">
            <el-checkbox
              v-for="(value,index) in statusMap"
              :key="index"
              :label="index">{{ value }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="$t('wander.wanderAlbums')" prop="wanderAlbums">
          <el-checkbox-group v-model="temp.wanderAlbums">
            <el-checkbox
              v-for="(wanderAlbumOption) in wanderAlbumOptions"
              :key="wanderAlbumOption.id"
              :label="wanderAlbumOption.id">{{ wanderAlbumOption.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="$t('wander.audio')" prop="audio">
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
        <el-form-item :label="$t('wander.copy')" prop="copy">
          <el-input
            :autosize="{ minRows: 2, maxRows: 4}"
            v-model="temp.copy"
            type="textarea"
            placeholder="请输入内容"/>
        </el-form-item>
        <el-form-item v-show="false" :label="$t('wander.author')" prop="author">
          <el-input v-model="temp.author"/>
        </el-form-item>
        <el-form-item :label="$t('wander.validTime')" prop="validTime">
          <el-date-picker v-model="temp.validTime" type="datetime" value-format="timestamp" placeholder="Please pick a date"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('wander.cancel') }}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{ $t('wander.confirm') }}</el-button>
        <el-button v-else type="primary" @click="updateData">{{ $t('wander.confirm') }}</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
/* eslint-disable arrow-spacing */

// import * as OSS from 'ali-oss'
import * as _ from 'lodash'
import WANDER_ALL from '@/graphqls/wanderAll.graphql'
import SCENE_ALL from '@/graphqls/sceneAll.graphql'
import WANDER_ALBUM_ALL from '@/graphqls/wanderAlbumAll.graphql'
import WANDER_UPDATE from '@/graphqls/wanderUpdate.graphql'
import WANDER_DELETE from '@/graphqls/wanderDelete.graphql'
import WANDER_REVERT_DELETED from '@/graphqls/wanderRevertDeleted.graphql'
import WANDER_CREATE from '@/graphqls/wanderCreate.graphql'
import USER_BY_ID from '@/graphqls/userById.graphql'
// import WANDER_ALBUM_BY_ID from '@/graphqls/wanderAlbumById.graphql'

export default {
  name: 'WanderTable',
  data() {
    return {
      statusMap: ['已删除', '标志位2', '标志位3'],
      statusFilter: [],
      uploadBackgroundAPI: process.env.BASE_API + '/uploadBackground/',
      uploadAudioAPI: process.env.BASE_API + '/uploadBackground/',
      sceneMap: {},
      sceneOptions: [],
      wanderAlbumOptions: [],
      userMap: {},
      wanderAlbumMap: {},
      wanderList: [],
      listLoading: true,
      temp: {
        scenes: [],
        wanderAlbums: [],
        validTime: 0
      },
      tempStatus: [],
      tempAudioFileList: [],
      tempBackgroundFileList: [],
      dialogStatus: 'create',
      dialogFormVisible: false
    }
  },
  async created() {
    await this.getScene()
    await this.getWanderAlbumAll()
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
    async getScene() {
      const result = await this.$apollo.query({ query: SCENE_ALL })
      this.sceneOptions = result.data.getScene.data
      result.data.getScene.data.forEach((scene) => {
        this.sceneMap[scene.id] = scene
      })
    },
    async getWanderAlbumAll() {
      const result = await this.$apollo.query({ query: WANDER_ALBUM_ALL, variables: { status: 0 }})
      this.wanderAlbumOptions = result.data.getWanderAlbum.data
      result.data.getWanderAlbum.data.forEach((wanderAlbum) => {
        this.wanderAlbumMap[wanderAlbum.id] = wanderAlbum
      })
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
    // async getWanderAlbum(wanderAlbumId) {
    //   const result = await this.$apollo.query({
    //     // 查询语句
    //     query: WANDER_ALBUM_BY_ID,
    //     // 参数
    //     variables: {
    //       id: wanderAlbumId
    //     }
    //   })
    //   console.log(result)
    //   this.wanderAlbumMap[wanderAlbumId] = result.data.getWanderAlbumById.data
    // },
    async getList(status = 0) {
      this.listLoading = true
      const result = await this.$apollo.query({
        // 查询语句
        query: WANDER_ALL,
        // 参数
        variables: {
          first: 20,
          status: status
        },
        fetchPolicy: 'network-only' // 只从网络获取
      })
      console.log(result.data)
      const promises = result.data.getWander.data.map((wander) => {
        return this.getUser(wander.author)
      })
      await Promise.all(promises)
      console.log(this.userMap)
      this.wanderList = result.data.getWander.data
      this.listLoading = false
    },
    resetTemp() {
      this.temp = {
        scenes: [],
        wanderAlbums: []
        // productId: []
      }
      this.tempStatus = []
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
      this.temp.price = parseInt(this.temp.price) || 0
      this.temp.description = this.temp.description || ''
      this.temp.copy = this.temp.copy || ''
      this.temp.validTime = Math.floor(this.temp.validTime / 1000)
      this.temp.status = this.tempStatus.reduce((accumulator, currentValue) => accumulator | (1 << currentValue), 0)
      // this.temp.productId = this.temp.productId.map((pidValue) => pidValue.value)
      const data = await this.$apollo.mutate({
        // 查询语句
        mutation: WANDER_CREATE,
        // 参数
        variables: {
          createData: this.temp
        }
      })

      console.log('getList')
      // const result = await this.$apollo.query({
      //   // 查询语句
      //   query: WANDER_ALL,
      //   // 参数
      //   variables: {
      //     first: 20
      //   },
      //   fetchPolicy: 'network-only' // 只从网络获取
      // })
      // this.wanderList = result.data.getWander.data
      await this.getList()

      if (data.data.createWander.code !== 200) {
        this.$notify({
          title: '失败',
          message: data.data.createWander.message,
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
        mutation: WANDER_UPDATE,
        // 参数
        variables: {
          id: this.temp.id,
          updateData: {
            background: this.temp.background,
            name: this.temp.name,
            description: this.temp.description || '',
            scenes: this.temp.scenes,
            // productId: this.temp.productId.map((pidValue) => pidValue.value),
            price: parseInt(this.temp.price) || 0,
            author: this.$store.getters.id,
            audio: this.temp.audio,
            copy: this.temp.copy || '',
            wanderAlbums: this.temp.wanderAlbums,
            status: this.tempStatus.reduce((accumulator, currentValue) => accumulator | (1 << currentValue), 0),
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
        mutation: WANDER_DELETE,
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
        mutation: WANDER_REVERT_DELETED,
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
