<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-if="this.$route.params && this.$route.params.id" :placeholder="$t('table.title')" v-model="listQuery.userId" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-select v-model="listQuery.type" :placeholder="$t('table.type')" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in accountTypeOptions" :key="item.key" :label="item.display_name+'('+item.key+')'" :value="item.key"/>
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      :row-class-name="tableRowClassName"
      border
      fit
      highlight-current-row
      style="width: 100%;">
      <el-table-column type="expand">
        <template slot-scope="scope">
          <span>{{ scope.row.extraInfo }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.id')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.nickname')" align="center">
        <template slot-scope="scope">
          <span>{{ userMap[scope.row.userId]?userMap[scope.row.userId].nickname:scope.row.userId }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.value')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.value }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.afterBalance')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.afterBalance }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.type')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.createTime')" align="center">
        <template slot-scope="scope">
          <span>{{ new Date(scope.row.createTime*1000) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination v-show="total>0" :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" :total="total" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>
  </div>
</template>

<style>
  .el-table .deposit-row {
    background: lightgreen;
  }

  .el-table .withdraw-row {
    background: lightcoral;
  }
</style>

<script>
import USER_ACCOUNT from '@/graphqls/userAccountSearch.graphql'
import USER_BY_ID from '@/graphqls/userById.graphql'

export default {
  name: 'UserAccount',
  data() {
    return {
      tableKey: 0,
      accountTypeOptions: [
        { key: '', display_name: '全部' },
        { key: 'deposit', display_name: '充值' },
        { key: 'mindfulness', display_name: '正态' },
        { key: 'mindfulnessRollback', display_name: '正态回滚' },
        { key: 'nature', display_name: '自然' },
        { key: 'natureRollback', display_name: '自然回滚' },
        { key: 'wander', display_name: '漫步' },
        { key: 'wanderRollback', display_name: '漫步回滚' },
        { key: 'wanderAlbum', display_name: '漫步专辑' },
        { key: 'wanderAlbumRollback', display_name: '漫步专辑回滚' }
      ],
      userMap: {},
      list: null,
      total: null,
      listLoading: false,
      listQuery: {
        userId: '',
        page: 1,
        limit: 20,
        type: ''
      },
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.listQuery.userId = this.$route.params && this.$route.params.userId
    this.getList()
  },
  methods: {
    tableRowClassName({ row, rowIndex }) {
      if (row.value >= 0) {
        return 'deposit-row'
      } else if (row.value <= 0) {
        return 'withdraw-row'
      }
      return ''
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
    async getList() {
      // this.listLoading = true
      // fetchList(this.listQuery).then(response => {
      //   this.list = response.data.items
      //   this.total = response.data.total
      //
      //   // Just to simulate the time of the request
      //   setTimeout(() => {
      //     this.listLoading = false
      //   }, 1.5 * 1000)
      // })
      this.listLoading = true
      const result = await this.$apollo.query({
        // 查询语句
        query: USER_ACCOUNT,
        // 参数
        variables: this.listQuery,
        fetchPolicy: 'network-only' // 只从网络获取
      })
      const promises = result.data.searchUserAccount.data.map((userAccount) => {
        return this.getUser(userAccount.userId)
      })
      await Promise.all(promises)
      this.list = result.data.searchUserAccount.data
      this.total = result.data.countUserAccount.data
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
    handleDelete(row) {
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      const index = this.list.indexOf(row)
      this.list.splice(index, 1)
    }
  }
}
</script>
