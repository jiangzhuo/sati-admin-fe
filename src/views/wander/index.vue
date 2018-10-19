<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">Add</el-button>
    </div>

    <el-table v-loading="listLoading" ref="dataTable" :data="wanderList" border fit highlight-current-row style="width: 100%;">
      <el-table-column :label="$t('table.id')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.name')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.description')" align="center">
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
      <el-table-column :label="$t('table.background')" align="center">
        <template slot-scope="scope">
          <a href="https://developer.mozilla.org/"><img :src="scope.row.background" style="width: auto; height: auto; max-width: 100%; max-height: 100%;"></a>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.price')" align="center">
        <template slot-scope="scope">
          <!--<el-tag v-for="pid in scope.row.productId" :key="pid">{{ pid }}</el-tag>-->
          <span>{{ scope.row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.scenes')" align="center">
        <template slot-scope="scope">
          <el-tag v-for="scene in scope.row.scenes" :key="scene">{{ sceneMap[scene].name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.audio')" align="center">
        <template slot-scope="scope">
          <audio :src="scope.row.audio" controls="controls"/>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.author')" align="center">
        <template slot-scope="scope">
          <a :href="'user/userInfo?userId='+scope.row.author" target="_blank">{{ userMap[scope.row.author]?userMap[scope.row.author].nickname:scope.row.author }}</a>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.copy')" align="center">
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
      <el-table-column :label="$t('table.wanderAlbums')" align="center">
        <template slot-scope="scope">
          <el-tag v-for="wanderAlbum in scope.row.wanderAlbums" :key="wanderAlbum">{{ wanderAlbumMap[wanderAlbum].name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.status')" align="center">
        <template slot-scope="scope">
          <!--<span>{{ scope.row.status }}</span>-->
          <el-tag v-if="scope.row.status&0b1" type="success">已删除</el-tag>
          <el-tag v-else type="danger">未删除</el-tag>
          <el-tag v-if="scope.row.status&0b10" type="success">第二标志位开</el-tag>
          <el-tag v-else type="danger">第二标志位关</el-tag>
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
          <el-button v-if="scope.row.status&0b1" type="info" size="small" icon="el-icon-delete" @click="handleRevertDeleted(scope.row)">revert</el-button>
          <el-button v-else type="danger" size="small" icon="el-icon-delete" @click="handleDelete(scope.row)">delete</el-button>
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
            :action="uploadBackgroundAPI"
            accept="image/*"
            list-type="picture">
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
        <el-form-item :label="$t('table.scenes')" prop="scenes">
          <el-checkbox-group v-model="temp.scenes">
            <el-checkbox
              v-for="(sceneOption) in sceneOptions"
              :key="sceneOption.id"
              :label="sceneOption.id">{{ sceneOption.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="$t('table.wanderAlbums')" prop="wanderAlbums">
          <el-checkbox-group v-model="temp.wanderAlbums">
            <el-checkbox
              v-for="(wanderAlbumOption) in wanderAlbumOptions"
              :key="wanderAlbumOption.id"
              :label="wanderAlbumOption.id">{{ wanderAlbumOption.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="$t('table.audio')" prop="audio">
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
            <div slot="tip" class="el-upload__tip">只能上传音频文件，且不超过20M</div>
          </el-upload>
        </el-form-item>
        <el-form-item :label="$t('table.copy')" prop="copy">
          <el-input
            :autosize="{ minRows: 2, maxRows: 4}"
            v-model="temp.copy"
            type="textarea"
            placeholder="请输入内容"/>
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
        wanderAlbums: []
      },
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
    beforeAudioUpload(file) {
      const isLt20M = file.size / 1024 / 1024 < 20

      if (!isLt20M) {
        this.$message.error('上传头像图片大小不能超过 20MB!')
      }
      return isLt20M
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
      const result = await this.$apollo.query({ query: WANDER_ALBUM_ALL })
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
    async getList() {
      this.listLoading = true
      const result = await this.$apollo.query({
        // 查询语句
        query: WANDER_ALL,
        // 参数
        variables: {
          first: 20
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
      // this.temp.productId = this.temp.productId.map((pid)=>{ return { value: pid } })
      this.tempBackgroundFileList = row.background ? [{ url: row.background }] : []
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
            description: this.temp.description,
            scenes: this.temp.scenes,
            // productId: this.temp.productId.map((pidValue) => pidValue.value),
            price: parseInt(this.temp.price),
            author: this.$store.getters.id,
            audio: this.temp.audio,
            copy: this.temp.copy,
            wanderAlbums: this.temp.wanderAlbums,
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
