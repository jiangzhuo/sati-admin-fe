<template>
  <div class="app-container">

    <div class="filter-container">
      <el-button style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">{{ $t('scene.add') }}</el-button>
    </div>

    <el-table v-loading="this.$apollo.queries.sceneList.loading" :data="sceneList" border fit highlight-current-row style="width: 100%">

      <el-table-column :label="$t('scene.id')" align="center" width="250">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('scene.name')">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-input v-model="scope.row.name" class="edit-input" size="small"/>
          </template>
          <span v-else>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('scene.actions')" align="center">
        <template slot-scope="scope">
          <el-button v-if="scope.row.edit" type="success" size="small" icon="el-icon-circle-check-outline" @click="confirmEdit(scope.row)">Ok</el-button>
          <el-button v-if="scope.row.edit" type="warning" size="small" icon="el-icon-refresh" @click="cancelEdit(scope.row)">cancel</el-button>
          <el-button v-if="scope.row.edit" type="danger" size="small" icon="el-icon-delete" @click="removeEdit(scope.row)">delete</el-button>
          <el-button v-else type="primary" size="small" icon="el-icon-edit" @click="scope.row.edit=!scope.row.edit">Edit</el-button>
        </template>
      </el-table-column>

    </el-table>

    <el-dialog :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item :label="$t('scene.name')" prop="name">
          <el-input v-model="temp.name"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('scene.cancel') }}</el-button>
        <el-button type="primary" @click="createEdit">{{ $t('scene.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import { fetchList } from '@/api/article'
import SCENE_ALL from '@/graphqls/sceneAll.graphql'
import SCENE_UPDATE from '@/graphqls/sceneUpdate.graphql'
import SCENE_DELETE from '@/graphqls/sceneDelete.graphql'
import SCENE_CREATE from '@/graphqls/sceneCreate.graphql'

export default {
  name: 'SceneEditTable',
  apollo: {
    sceneList: {
      query: SCENE_ALL,
      deep: false,
      update(res) {
        // 返回的值将更新 vue 属性 'pingMessage'
        // return res.getScene.data
        return res.getScene.data.map(v => {
          this.$set(v, 'edit', false) // https://vuejs.org/v2/guide/reactivity.html
          v.originalName = v.name //  will be used when user click the cancel botton
          return v
        })
      }
    }
  },
  data() {
    return {
      dialogFormVisible: false,
      temp: {},
      sceneList: null,
      listQuery: {
        page: 1,
        limit: 10
      }
    }
  },
  created() {
  },
  methods: {
    handleCreate() {
      this.temp = {}
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    cancelEdit(row) {
      row.name = row.originalName
      row.edit = false
      this.$message({
        message: 'The name has been restored to the original value',
        type: 'warning'
      })
    },
    confirmEdit(row) {
      row.edit = false
      // 调用 graphql 变更
      this.$apollo.mutate({
        // 查询语句
        mutation: SCENE_UPDATE,
        // 参数
        variables: {
          id: row.id,
          name: row.name
        },
        refetchQueries: [{ query: SCENE_ALL }],
        awaitRefetchQueries: true
      }).then((data) => {
        // 结果
        row.originalName = row.name
        this.$message({
          message: 'The name has been edited',
          type: 'success'
        })
      }).catch((error) => {
        // 错误
        console.error(error)
        // 恢复初始用户输入
        row.name = row.originalName
      })
    },
    removeEdit(row) {
      // 调用 graphql 变更
      this.$apollo.mutate({
        // 查询语句
        mutation: SCENE_DELETE,
        // 参数
        variables: {
          id: row.id
        },
        refetchQueries: [{ query: SCENE_ALL }],
        awaitRefetchQueries: true
      }).then((data) => {
        // 结果
        row.originalName = row.name
        this.$message({
          message: 'The name has been deleted',
          type: 'success'
        })
      }).catch((error) => {
        // 错误
        console.error(error)
        // 恢复初始用户输入
        row.name = row.originalName
      })
    },
    createEdit() {
      console.log(this.temp.name)
      this.$apollo.mutate({
        // 查询语句
        mutation: SCENE_CREATE,
        // 参数
        variables: {
          name: this.temp.name
        },
        refetchQueries: [{ query: SCENE_ALL }],
        awaitRefetchQueries: true
      }).then((data) => {
        if (data.data.createScene.code !== 200) {
          this.$notify({
            title: '失败',
            message: data.data.createScene.message,
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
      }).catch((error) => {
        // 错误
        console.error(error)
      })
    }
  }
}
</script>

<style scoped>
  .edit-input {
    padding-right: 100px;
  }
  .cancel-btn {
    position: absolute;
    right: 15px;
    top: 10px;
  }
</style>
