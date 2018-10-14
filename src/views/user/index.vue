<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input :placeholder="$t('table.title')" v-model="listQuery.keyword" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key"/>
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;">
      <el-table-column :label="$t('table.id')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.mobile')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.mobile }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.nickname')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.balance')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.balance }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.createTime')" align="center">
        <template slot-scope="scope">
          <span>{{ new Date(scope.row.createTime*1000) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.status')" align="center">
        <template slot-scope="scope">
          <!--<span>{{ scope.row.status }}</span>-->
          <el-tag v-if="scope.row.status&0b1" type="success">第一标志位开</el-tag>
          <el-tag v-else type="danger">第一标志位关</el-tag>
          <el-tag v-if="scope.row.status&0b10" type="success">第二标志位开</el-tag>
          <el-tag v-else type="danger">第二标志位关</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.updateTime')" align="center">
        <template slot-scope="scope">
          <span>{{ new Date(scope.row.updateTime*1000) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center">
        <template slot-scope="scope">
          <router-link :to="'/user/account/'+scope.row.id">
            <el-button type="primary" size="small" icon="el-icon-edit">消费明细</el-button>
          </router-link>
          <el-button v-if="scope.row.status&0b1" type="info" size="small" icon="el-icon-delete" @click="handleRevertDeleted(scope.row)">恢复账号</el-button>
          <el-button v-else type="danger" size="small" icon="el-icon-delete" @click="handleDelete(scope.row)">封号</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination v-show="total>0" :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" :total="total" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>
  </div>
</template>

<script>
// import { fetchList, createArticle, updateArticle } from '@/api/article'
import USER_SEARCH from '@/graphqls/userSearch.graphql'

export default {
  name: 'UserTable',
  data() {
    return {
      tableKey: 0,
      list: null,
      total: null,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
        keyword: '',
        sort: '+_id'
      },
      sortOptions: [{ label: 'ID Ascending', key: '+_id' }, { label: 'ID Descending', key: '-_id' }],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      }
    }
  },
  created() {
    // this.getList()
  },
  methods: {
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
        query: USER_SEARCH,
        // 参数
        variables: this.listQuery,
        fetchPolicy: 'network-only' // 只从网络获取
      })
      this.list = result.data.searchUser.data
      this.total = result.data.countUser.data
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
