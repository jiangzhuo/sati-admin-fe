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
import SCENE_ALL from '@/graphqls/sceneAll.graphql'
import MINDFULNESS_ALBUM_ALL from '@/graphqls/mindfulnessAlbumAll.graphql'
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
      uploadBackgroundAPI: process.env.BASE_API + '/uploadBackground/',
      uploadAudioAPI: process.env.BASE_API + '/uploadBackground/',
      mindfulnessList: [
        // {
        //   'id': '5ba0db5b18b0d02bbf55b832',
        //   'background': 'https://www.baidu.com/img/bd_logo1.png',
        //   'name': 'zhengtai1',
        //   'description': 'zhengtai1miaoshu',
        //   'scenes': [],
        //   'productId': [
        //     'ai.kizuna.store.iap6'
        //   ],
        //   'createTime': 1000.0,
        //   'updateTime': 2000.0,
        //   'author': '5b9f3e11162fd54f50c4dc3d',
        //   'audio': 'http://developer.mozilla.org/@api/deki/files/2926/=AudioTest_(1).ogg',
        //   'copy': 'wenan1111111',
        //   'status': 1.0
        // },
        // {
        //   'id': '5bab3e9e83884e50cda3c5ca',
        //   'scenes': [
        //     '5bab1aa8d51e3c401a5c7f3c'
        //   ],
        //   'productId': [
        //     'iap6'
        //   ],
        //   'background': 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjE0NnB4IiBoZWlnaHQ9IjM4cHgiIHZpZXdCb3g9IjAgMCAxNDYgMzgiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDQwICgzMzc2MikgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+U2hhcGUgQ29weTwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxkZWZzPjwvZGVmcz4KICAgIDxnIGlkPSJ2Mi4yLjAiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSLpppbpobUt6buY6K6k5pWI5p6cLWNvcHktMiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTcwLjAwMDAwMCwgLTE5LjAwMDAwMCkiIGZpbGw9IiM0MDlFRkYiPgogICAgICAgICAgICA8cGF0aCBkPSJNMjEyLjEzNTQ0MSw0NS4xNTc4MDc3IEMyMTIuMTM1NDQxLDQ1LjE1NzgwNzcgMjEyLjQyMDIzNyw0NS4xNTA1MTA1IDIxMi45NjA5MzcsNDUuMTU3ODA3NyBDMjEzLjUwMTYzNyw0NS4xNjUxMDQ5IDIxMy42NDg4NTEsNDUuNTcwODU1NiAyMTMuNjQ4ODUxLDQ1LjU3MDg1NTYgQzIxMy42NDg4NTEsNDUuNTcwODU1NiAyMTQuNzMzODI4LDQ3LjU2NjU2NTcgMjE1LjAyNDY3Nyw0OC4wNDkxNDM0IEMyMTUuMjgzNjA4LDQ4LjQ3ODcxMzMgMjE0Ljk3MzIyMSw0OC40NzA4NjU0IDIxNC45MDE4MTYsNDguNDYzODQzNiBDMjE0LjkwMjUwNCw0OC40NjI4Nzk4IDIxNC44ODcwOTUsNDguNDYyMTkxNCAyMTQuODg3MDk1LDQ4LjQ2MjE5MTQgQzIxNC44ODcwOTUsNDguNDYyMTkxNCAyMTQuODkzMDExLDQ4LjQ2MzAxNzUgMjE0LjkwMTgxNiw0OC40NjM4NDM2IEMyMTQuODk4NjUyLDQ4LjQ2ODI0OTUgMjE0LjU5NDczMSw0OC40NzgzMDAzIDIxMS40NDc1MjgsNDguNDYyMTkxNCBDMjA3LjA1ODY0MSw0Ny44NjY1NzYyIDIwNi45MDczLDQzLjkxODY2MzggMjA2LjkwNzMsNDMuOTE4NjYzOCBMMjA2LjkwNzMsMzYuODk2ODQ4MyBMMjA0LjQzMDgxMiwzNi44OTY4NDgzIEwyMDQuNDMwODEyLDM0LjI4MDg3NzkgQzIwNC40MzA4MTIsMzMuOTI0Mjc5OCAyMDQuODQzNTYsMzMuODY3ODI5OSAyMDQuODQzNTYsMzMuODY3ODI5OSBMMjA2LjkwNzMsMzMuODY3ODI5OSBMMjA2LjkwNzMsMzEuMjUxODU5NCBDMjA2LjkwNzMsMzAuODI1MTgwOSAyMDcuMzIwMDQ4LDMwLjcwMTEyODggMjA3LjMyMDA0OCwzMC43MDExMjg4IEMyMDcuMzIwMDQ4LDMwLjcwMTEyODggMjA4Ljc3MjY0NiwzMC4yODU4Nzc5IDIwOS42MTc4MTYsMzAuMDQ0MTA3MiBDMjA5Ljk2NDY2MiwyOS45NDQ5NzU2IDIxMC4wNzE3MDEsMzAuMTUwMzk4MiAyMTAuMDcxNzAxLDMwLjE1MDM5ODIgQzIxMC4wNzE3MDEsMzAuMTUwMzk4MiAyMTAuMjA5Mjg0LDMwLjA3NzQyNjQgMjEwLjIwOTI4NCwzMC4zOTI3MTk2IEwyMTAuMjA5Mjg0LDM0LjAwNTUxMjUgTDIxMy43ODY0MzMsMzQuMDA1NTEyNSBDMjE0LjEzNDY1NSwzNC4wMDU1MTI1IDIxNC4xOTkxODEsMzQuNDE4NTYwNSAyMTQuMTk5MTgxLDM0LjQxODU2MDUgTDIxNC4xOTkxODEsMzcuMDM0NTMxIEwyMTAuMjA5Mjg0LDM3LjAzNDUzMSBMMjEwLjIwOTI4NCw0My4wOTI1Njc4IEMyMTAuMjA5Mjg0LDQ0Ljg1MzM5MTMgMjEyLjEzNTQ0MSw0NS4xNTc4MDc3IDIxMi4xMzU0NDEsNDUuMTU3ODA3NyBMMjEyLjEzNTQ0MSw0NS4xNTc4MDc3IFogTTIwMS41NDE1NzYsNDguMTg2ODI2MSBMMTk5LjM0MDI1Myw0OC4xODY4MjYxIEMxOTguOTA4MzgxLDQ4LjE4NjgyNjEgMTk4LjkyNzUwNSw0Ny42MzYwOTU1IDE5OC45Mjc1MDUsNDcuNjM2MDk1NSBMMTk4LjkyNzUwNSwzNy40NDc1Nzg5IEMxOTguOTI3NTA1LDM2LjgyODY5NTQgMTk4LjEwMjAwOSwzNi42MjE0ODMgMTk4LjEwMjAwOSwzNi42MjE0ODMgTDE5My41NjE3ODEsMzYuNjIxNDgzIEMxOTIuODg0NDYyLDM2LjYyMTQ4MyAxOTIuODczODY4LDM3LjQ0NzU3ODkgMTkyLjg3Mzg2OCwzNy40NDc1Nzg5IEwxOTIuODczODY4LDQ3Ljc3Mzc3ODEgQzE5Mi44NzM4NjgsNDguMTc4NzAyOCAxOTIuNDYxMTIsNDguMTg2ODI2MSAxOTIuNDYxMTIsNDguMTg2ODI2MSBMMTkwLjI1OTc5Nyw0OC4xODY4MjYxIEMxODkuNzc1NzgyLDQ4LjE4NjgyNjEgMTg5Ljg0NzA0OSw0Ny42MzYwOTU1IDE4OS44NDcwNDksNDcuNjM2MDk1NSBMMTg5Ljg0NzA0OSwzNC44MzE2MDg1IEMxODkuODQ3MDQ5LDMzLjgwMzExOSAxOTEuMDg1MjkzLDMzLjU5MjQ2NDYgMTkxLjA4NTI5MywzMy41OTI0NjQ2IEwyMDAuNzE2MDgsMzMuNTkyNDY0NiBDMjAxLjY3Nzc4MywzMy41OTI0NjQ2IDIwMS45NTQzMjQsMzQuODMxNjA4NSAyMDEuOTU0MzI0LDM0LjgzMTYwODUgTDIwMS45NTQzMjQsNDcuNDk4NDEyOCBDMjAxLjk1NDMyNCw0OC4yMTg2MzA4IDIwMS41NDE1NzYsNDguMTg2ODI2MSAyMDEuNTQxNTc2LDQ4LjE4NjgyNjEgTDIwMS41NDE1NzYsNDguMTg2ODI2MSBaIE0xODUuODU3MTUyLDQyLjQwNDE1NDYgTDE3Ny4zMjcwMjcsNDIuNDA0MTU0NiBMMTc3LjMyNzAyNyw0NC40NjkzOTQ0IEMxNzcuMzI3MDI3LDQ1LjIxMzU2OTEgMTc4LjI5MDEwNiw0NS40MzMxNzMgMTc4LjI5MDEwNiw0NS40MzMxNzMgTDE4NS4xNjkyMzksNDUuNDMzMTczIEMxODUuNjU4NzU4LDQ1LjQzMzE3MyAxODUuOTk0NzM1LDQ1Ljg0NjIyMSAxODUuOTk0NzM1LDQ1Ljg0NjIyMSBDMTg1Ljk5NDczNSw0NS44NDYyMjEgMTg2LjU5NTAwOCw0Ny4wOTUxNDAzIDE4Ni44MjAyMzEsNDcuNjM2MDk1NSBDMTg3LjA0NTQ1NCw0OC4xNzcwNTA2IDE4Ni40MDc0ODMsNDguMTg2ODI2MSAxODYuNDA3NDgzLDQ4LjE4NjgyNjEgTDE3Ni4wODg3ODMsNDguMTg2ODI2MSBDMTc0Ljg0NjEzNiw0OC4xODY4MjYxIDE3NC41NzUzNzQsNDYuNjcyMzE2OSAxNzQuNTc1Mzc0LDQ2LjY3MjMxNjkgTDE3NC41NzUzNzQsMzQuOTY5MjkxMSBDMTc0LjU3NTM3NCwzNC4yOTYyOTgzIDE3NS41Mzg0NTIsMzQuMDA1NTEyNSAxNzUuNTM4NDUyLDM0LjAwNTUxMjUgTDE4NS44NTcxNTIsMzQuMDA1NTEyNSBDMTg2Ljg5NDExMywzNC4wMDU1MTI1IDE4Ny4wOTUzOTYsMzUuMjQ0NjU2NCAxODcuMDk1Mzk2LDM1LjI0NDY1NjQgTDE4Ny4wOTUzOTYsNDEuMTY1MDEwNyBDMTg3LjA5NTM5Niw0Mi4xNjM4OTgzIDE4NS44NTcxNTIsNDIuNDA0MTU0NiAxODUuODU3MTUyLDQyLjQwNDE1NDYgTDE4NS44NTcxNTIsNDIuNDA0MTU0NiBaIE0xODQuMzQzNzQzLDM3LjQ0NzU3ODkgQzE4NC4zNDM3NDMsMzcuNDQ3NTc4OSAxODQuMjU3MDY2LDM2Ljc1OTE2NTcgMTgzLjY1NTgzLDM2Ljc1OTE2NTcgTDE3OC4wMTQ5NCwzNi43NTkxNjU3IEMxNzguMDE0OTQsMzYuNzU5MTY1NyAxNzcuMzI3MDI3LDM2Ljk0Mzc5ODEgMTc3LjMyNzAyNywzNy40NDc1Nzg5IEwxNzcuMzI3MDI3LDM4Ljk2MjA4ODIgQzE3Ny4zMjcwMjcsMzguOTYyMDg4MiAxNzcuMzQ2ODM5LDM5LjY1MDUwMTQgMTc4LjAxNDk0LDM5LjY1MDUwMTQgTDE4My42NTU4MywzOS42NTA1MDE0IEMxODMuNjU1ODMsMzkuNjUwNTAxNCAxODQuMzQzNzQzLDM5LjQ4MDQ2MzQgMTg0LjM0Mzc0MywzOC44MjQ0MDU1IEwxODQuMzQzNzQzLDM3LjQ0NzU3ODkgTDE4NC4zNDM3NDMsMzcuNDQ3NTc4OSBaIE0xNzEuNDEwOTcyLDQ4LjE4NjgyNjEgTDE2OS4yMDk2NSw0OC4xODY4MjYxIEMxNjguOTE5MjEzLDQ4LjE4NjgyNjEgMTY4Ljc5NjkwMiw0Ny43NzM3NzgxIDE2OC43OTY5MDIsNDcuNzczNzc4MSBMMTY4Ljc5NjkwMiwzNy40NDc1Nzg5IEMxNjguNzk2OTAyLDM2LjgwNzIxNjkgMTY3Ljk3MTQwNiwzNi42MjE0ODMgMTY3Ljk3MTQwNiwzNi42MjE0ODMgTDE2NS45MDc2NjYsMzYuNjIxNDgzIEMxNjUuMzMxODgyLDM2LjYyMTQ4MyAxNjUuMjE5NzUyLDM3LjQ0NzU3ODkgMTY1LjIxOTc1MiwzNy40NDc1Nzg5IEwxNjUuMjE5NzUyLDQ3Ljc3Mzc3ODEgQzE2NS4yMTk3NTIsNDguMTE2MzMyNiAxNjQuODA3MDA0LDQ4LjE4NjgyNjEgMTY0LjgwNzAwNCw0OC4xODY4MjYxIEwxNjIuNjA1NjgyLDQ4LjE4NjgyNjEgQzE2Mi4yOTk1Niw0OC4xODY4MjYxIDE2Mi4xOTI5MzQsNDcuNzczNzc4MSAxNjIuMTkyOTM0LDQ3Ljc3Mzc3ODEgTDE2Mi4xOTI5MzQsMzcuNDQ3NTc4OSBDMTYyLjE5MjkzNCwzNi43OTI4OTc5IDE2MS4zNjc0MzgsMzYuNjIxNDgzIDE2MS4zNjc0MzgsMzYuNjIxNDgzIEwxNTkuMzAzNjk4LDM2LjYyMTQ4MyBDMTU4LjY3Mzk4MiwzNi42MjE0ODMgMTU4LjYxNTc4NCwzNy40NDc1Nzg5IDE1OC42MTU3ODQsMzcuNDQ3NTc4OSBMMTU4LjYxNTc4NCw0Ny43NzM3NzgxIEMxNTguNjE1Nzg0LDQ4LjIxNTczOTUgMTU4LjIwMzAzNiw0OC4xODY4MjYxIDE1OC4yMDMwMzYsNDguMTg2ODI2MSBMMTU2LjAwMTcxNCw0OC4xODY4MjYxIEMxNTUuNTg5Mzc4LDQ4LjE4NjgyNjEgMTU1LjU4ODk2Niw0Ny43NzM3NzgxIDE1NS41ODg5NjYsNDcuNzczNzc4MSBMMTU1LjU4ODk2NiwzNC42OTM5MjU4IEMxNTUuNTg4OTY2LDMzLjkzNjI1ODIgMTU2LjY4OTYyNywzMy41OTI0NjQ2IDE1Ni42ODk2MjcsMzMuNTkyNDY0NiBMMTcwLjQ0Nzg5NCwzMy41OTI0NjQ2IEMxNzEuNTUyMjcsMzMuNTkyNDY0NiAxNzEuODIzNzIsMzQuOTY5MjkxMSAxNzEuODIzNzIsMzQuOTY5MjkxMSBMMTcxLjgyMzcyLDQ3Ljc3Mzc3ODEgQzE3MS44MjM3Miw0OC4yNDkzMzQgMTcxLjQxMDk3Miw0OC4xODY4MjYxIDE3MS40MTA5NzIsNDguMTg2ODI2MSBMMTcxLjQxMDk3Miw0OC4xODY4MjYxIFogTTE1MS40NjE0ODYsNDIuNDA0MTU0NiBMMTQyLjkzMTM2LDQyLjQwNDE1NDYgTDE0Mi45MzEzNiw0NC40NjkzOTQ0IEMxNDIuOTMxMzYsNDUuMjEzNTY5MSAxNDMuODk0NDM5LDQ1LjQzMzE3MyAxNDMuODk0NDM5LDQ1LjQzMzE3MyBMMTUwLjc3MzU3Miw0NS40MzMxNzMgQzE1MS4yNjMwOTIsNDUuNDMzMTczIDE1MS41OTkwNjgsNDUuODQ2MjIxIDE1MS41OTkwNjgsNDUuODQ2MjIxIEMxNTEuNTk5MDY4LDQ1Ljg0NjIyMSAxNTIuMTk5MjA0LDQ3LjA5NTE0MDMgMTUyLjQyNDU2NCw0Ny42MzYwOTU1IEMxNTIuNjQ5Nzg3LDQ4LjE3NzA1MDYgMTUyLjAxMTgxNiw0OC4xODY4MjYxIDE1Mi4wMTE4MTYsNDguMTg2ODI2MSBMMTQxLjY5MzExNyw0OC4xODY4MjYxIEMxNDAuNDUwNDcsNDguMTg2ODI2MSAxNDAuMTc5NzA3LDQ2LjY3MjMxNjkgMTQwLjE3OTcwNyw0Ni42NzIzMTY5IEwxNDAuMTc5NzA3LDM0Ljk2OTI5MTEgQzE0MC4xNzk3MDcsMzQuMjk2Mjk4MyAxNDEuMTQyNzg2LDM0LjAwNTUxMjUgMTQxLjE0Mjc4NiwzNC4wMDU1MTI1IEwxNTEuNDYxNDg2LDM0LjAwNTUxMjUgQzE1Mi40OTg0NDYsMzQuMDA1NTEyNSAxNTIuNjk5NzMsMzUuMjQ0NjU2NCAxNTIuNjk5NzMsMzUuMjQ0NjU2NCBMMTUyLjY5OTczLDQxLjE2NTAxMDcgQzE1Mi42OTk3Myw0Mi4xNjM4OTgzIDE1MS40NjE0ODYsNDIuNDA0MTU0NiAxNTEuNDYxNDg2LDQyLjQwNDE1NDYgTDE1MS40NjE0ODYsNDIuNDA0MTU0NiBaIE0xNDkuOTQ4MDc2LDM3LjQ0NzU3ODkgQzE0OS45NDgwNzYsMzcuNDQ3NTc4OSAxNDkuODYxMzk5LDM2Ljc1OTE2NTcgMTQ5LjI2MDE2MywzNi43NTkxNjU3IEwxNDMuNjE5Mjc0LDM2Ljc1OTE2NTcgQzE0My42MTkyNzQsMzYuNzU5MTY1NyAxNDIuOTMxMzYsMzYuOTQzNzk4MSAxNDIuOTMxMzYsMzcuNDQ3NTc4OSBMMTQyLjkzMTM2LDM4Ljk2MjA4ODIgQzE0Mi45MzEzNiwzOC45NjIwODgyIDE0Mi45NTExNzIsMzkuNjUwNTAxNCAxNDMuNjE5Mjc0LDM5LjY1MDUwMTQgTDE0OS4yNjAxNjMsMzkuNjUwNTAxNCBDMTQ5LjI2MDE2MywzOS42NTA1MDE0IDE0OS45NDgwNzYsMzkuNDgwNDYzNCAxNDkuOTQ4MDc2LDM4LjgyNDQwNTUgTDE0OS45NDgwNzYsMzcuNDQ3NTc4OSBMMTQ5Ljk0ODA3NiwzNy40NDc1Nzg5IFogTTEzOC4xMTU5NjcsNDguMTg2ODI2MSBMMTMyLjg4NzgyNiw0OC4xODY4MjYxIEMxMzIuODg3ODI2LDQ4LjE4NjgyNjEgMTI5LjA2MTkyNyw0OC4wMDYxODY1IDEyOC43NjAzNDYsNDQuMTk0MDI5MSBDMTI4Ljc0ODIzOSw0MC4yNzkwMjI4IDEyOC43NjAzNDYsMjguMDg1MTU4MyAxMjguNzYwMzQ2LDI4LjA4NTE1ODMgTDEzMS4yMzY4MzQsMjguMDg1MTU4MyBDMTMxLjIzNjgzNCwyOC4wODUxNTgzIDEzMi4wNjIzMywyOC4wNzAxNTA5IDEzMi4wNjIzMywyOC45MTEyNTQzIEwxMzIuMDYyMzMsNDMuMzY3OTMzMSBDMTMyLjA2MjMzLDQzLjM2NzkzMzEgMTMyLjM1MDAxNSw0NC41NjM4NDQ3IDEzMy45ODg0ODcsNDUuMDIwMTI1IEMxMzUuODM5OCw0NS4wMTA3NjI2IDEzNi4xODk4MSw0NS4wMjAxMjUgMTM2LjE4OTgxLDQ1LjAyMDEyNSBDMTM2LjE4OTgxLDQ1LjAyMDEyNSAxMzYuOTA3MzAzLDQ0Ljc5MDE5NSAxMzcuNDI4MDU0LDQ1LjcwODUzODMgQzEzNy45NDg4MDQsNDYuNjI2ODgxNiAxMzguNTI4NzE1LDQ3LjYzNjA5NTUgMTM4LjUyODcxNSw0Ny42MzYwOTU1IEMxMzguNTI4NzE1LDQ3LjYzNjA5NTUgMTM4LjYxMTU0LDQ4LjE4NjgyNjEgMTM4LjExNTk2Nyw0OC4xODY4MjYxIEwxMzguMTE1OTY3LDQ4LjE4NjgyNjEgWiBNMTExLjU2MjUxMyw0Ny4zNjA3MzAyIEwxMTEuNTYyNTEzLDI5LjE4NjYxOTYgQzExMS41NjI1MTMsMjguMzgwNzYzIDExMi4yNTA0MjYsMjguMjIyODQxIDExMi4yNTA0MjYsMjguMjIyODQxIEwxMjUuMTgzMTk3LDI4LjIyMjg0MSBDMTI1LjkwNjQ2OSwyOC4yMjI4NDEgMTI1LjU5NTk0NSwyOS4wNDg5MzY5IDEyNS41OTU5NDUsMjkuMDQ4OTM2OSBDMTI1LjU5NTk0NSwyOS4wNDg5MzY5IDEyNS4xOTI4MjcsMzAuMTY2MDk0IDEyNC45MDgwMzEsMzAuNzAxMTI4OCBDMTI0LjYyMzIzNSwzMS4yMzYxNjM2IDEyNC4wODI1MzUsMzEuMjUxODU5NCAxMjQuMDgyNTM1LDMxLjI1MTg1OTQgTDExNS42ODk5OTMsMzEuMjUxODU5NCBDMTE0LjkwODUyMywzMS4yNTE4NTk0IDExNC44NjQ0OTcsMzEuOTQwMjcyNyAxMTQuODY0NDk3LDMxLjk0MDI3MjcgTDExNC44NjQ0OTcsMzYuNDgzODAwMyBMMTI0LjM1NzcwMSwzNi40ODM4MDAzIEMxMjQuOTE0NjM1LDM2LjQ4MzgwMDMgMTI0LjYzMjg2NiwzNy4xNzIyMTM2IDEyNC42MzI4NjYsMzcuMTcyMjEzNiBDMTI0LjYzMjg2NiwzNy4xNzIyMTM2IDEyMy45MjE4MzksMzguNjg4OTI1OCAxMjMuNjY5Nzg3LDM5LjA5OTc3MDggQzEyMy40MTc3MzYsMzkuNTEwNjE1OSAxMjIuODQ0MjkxLDM5LjUxMjgxODggMTIyLjg0NDI5MSwzOS41MTI4MTg4IEwxMTQuODY0NDk3LDM5LjUxMjgxODggTDExNC44NjQ0OTcsNDQuMzMxNzExNyBDMTE0Ljg2NDQ5Nyw0NC45ODg0NTggMTE1LjU1MjQxLDQ1LjE1NzgwNzcgMTE1LjU1MjQxLDQ1LjE1NzgwNzcgTDEyNC4zNTc3MDEsNDUuMTU3ODA3NyBDMTI0Ljk5NjIyMiw0NS4xNTc4MDc3IDEyNS4xODMxOTcsNDUuNTcwODU1NiAxMjUuMTgzMTk3LDQ1LjU3MDg1NTYgQzEyNS4xODMxOTcsNDUuNTcwODU1NiAxMjYuMDU1MTk2LDQ2LjkzMjM5OTQgMTI2LjQyMTQ0MSw0Ny40OTg0MTI4IEMxMjYuNzg3ODIzLDQ4LjA2NDQyNjIgMTI2LjI4Mzg1OCw0OC4xODY4MjYxIDEyNi4yODM4NTgsNDguMTg2ODI2MSBMMTEyLjM4ODAwOSw0OC4xODY4MjYxIEMxMTEuODE0MTUxLDQ4LjE4NjgyNjEgMTExLjU2MjUxMyw0Ny4zNjA3MzAyIDExMS41NjI1MTMsNDcuMzYwNzMwMiBaIE0xMDMuNDE2NTAyLDQ2LjIxNzU1MTEgQzEwMy40MDcwMDgsNDcuNzk0NTY4MiAxMDIuNTg3ODQxLDQ4LjE0NjM0NzQgMTAyLjU4Nzg0MSw0OC4xNDYzNDc0IEMxMDIuNTg3ODQxLDQ4LjE0NjM0NzQgODguNDUyMDQ3OCw1Ni4zMTQ1MDg3IDg3LjUzMjk5NTYsNTYuODI2Mjc1MSBDODYuNjIyMzM2LDU3LjIxNzE1NjEgODYuMDEzNjcwMyw1Ni44MjYyNzUxIDg2LjAxMzY3MDMsNTYuODI2Mjc1MSBDODYuMDEzNjcwMyw1Ni44MjYyNzUxIDcxLjIyMjU3MDYsNDguMjQ3OTU3MiA3MC42ODI2OTYyLDQ3Ljg3MDg0NDQgQzcwLjE0MjY4NDMsNDcuNDkzNzMxNiA3MC4xMzAxNjQzLDQ2LjkwNjM3NzQgNzAuMTMwMTY0Myw0Ni45MDYzNzc0IEM3MC4xMzAxNjQzLDQ2LjkwNjM3NzQgNzAuMTQ1MDIzMiwyOS45MTk5MTc0IDcwLjEzMDE2NDMsMjkuMTMzMzM2NCBDNzAuMTE1MzA1MywyOC4zNDY2MTc3IDcxLjA5Njk1NzYsMjcuNzU1NTQ2MSA3MS4wOTY5NTc2LDI3Ljc1NTU0NjEgTDg1Ljg3NTUzNzMsMTkuMjEzNDM4NyBDODYuNzg1MzcxNCwxOC43MzMyMDE2IDg3LjY3MTEyODYsMTkuMjEzNDM4NyA4Ny42NzExMjg2LDE5LjIxMzQzODcgQzg3LjY3MTEyODYsMTkuMjEzNDM4NyAxMDAuNzI2NjIzLDI2LjgwMjA5MzcgMTAyLjE3MzQ0MiwyNy42MTc3MjU3IEMxMDMuNTkxNTA3LDI4LjI5MTk1NzcgMTAzLjQxNjUwMiwyOS42ODQzNDI0IDEwMy40MTY1MDIsMjkuNjg0MzQyNCBDMTAzLjQxNjUwMiwyOS42ODQzNDI0IDEwMy40MjUzMDcsNDQuNzUxOTE5MiAxMDMuNDE2NTAyLDQ2LjIxNzU1MTEgTDEwMy40MTY1MDIsNDYuMjE3NTUxMSBaIE05Ny41MTYwMTA1LDI5LjE2OTEzMzkgQzk0LjQ5MDAxNzMsMjcuNDI3NDQ4MyA4Ny4zNjE1ODQyLDIzLjI5NzEwNjMgODcuMzYxNTg0MiwyMy4yOTcxMDYzIEM4Ny4zNjE1ODQyLDIzLjI5NzEwNjMgODYuNjY2MTAzOSwyMi45MjEyMzI2IDg1Ljk1MTc3NDcsMjMuMjk3MTA2MyBMNzQuMzQ4NzQwNiwyOS45ODIxNSBDNzQuMzQ4NzQwNiwyOS45ODIxNSA3My41NzgwMDI1LDMwLjQ0NDkwMTQgNzMuNTg5Njk3LDMxLjA2MDQ4MDUgQzczLjYwMTM5MTUsMzEuNjc2MDU5NyA3My41ODk2OTcsNDQuOTY5ODcwOCA3My41ODk2OTcsNDQuOTY5ODcwOCBDNzMuNTg5Njk3LDQ0Ljk2OTg3MDggNzMuNTk5NDY1NCw0NS40Mjk1OTMyIDc0LjAyMzQ5NTEsNDUuNzI0NjQ3MiBDNzQuNDQ3Mzg3Myw0Ni4wMTk3MDExIDg2LjA2MDE4OTgsNTIuNzMzMjQ1MSA4Ni4wNjAxODk4LDUyLjczMzI0NTEgQzg2LjA2MDE4OTgsNTIuNzMzMjQ1MSA4Ni41MzgxNTIsNTMuMDM5MTc1OSA4Ny4yNTMwMzE1LDUyLjczMzI0NTEgQzg3Ljk3NDY1MjYsNTIuMzMyNzI2MiA5OS4wNzMwMzM1LDQ1Ljk0MDI1ODIgOTkuMDczMDMzNSw0NS45NDAyNTgyIEM5OS4wNzMwMzM1LDQ1Ljk0MDI1ODIgOTkuNzE2MjMyNSw0NS42NjQ4OTI5IDk5LjcyMzY2MTksNDQuNDMwNzA1NiBDOTkuNzI1NzI1Nyw0NC4wNzQ3OTU5IDk5LjcyNjU1MTIsNDIuNjkzMjg4MSA5OS43MjY2ODg3LDQwLjk1NzUyMjkgTDg2LjY2MDA1MDIsNDguODc1MjM5NCBMODYuNjYwMDUwMiw0NS44NDYyMjEgQzg2LjY2MDA1MDIsNDQuNjAyMTIwNSA4Ny42MjMxMjg5LDQzLjc4MDk4MTEgODcuNjIzMTI4OSw0My43ODA5ODExIEw5OS4xODA3NjA3LDM2LjgxNjU3OTMgQzk5LjYxNjg5NzgsMzYuMzYxMTI1MSA5OS43MDY4NzY4LDM1LjYzMTU0NDcgOTkuNzI1NDUwNSwzNS4zNTU2Mjg3IEM5OS43MjUwMzc4LDM0LjA5MDQ2MjcgOTkuNzI0NDg3NCwzMi45ODUyODQxIDk5LjcyNDA3NDcsMzIuMjg1MTY3OCBMODYuNjYwMDUwMiw0MC4yMDEyMzIxIEw4Ni42NjAwNTAyLDM3LjAzNDUzMSBDODYuNjYwMDUwMiwzNS43OTA0MzA1IDg3LjQ4NTU0NjIsMzUuMjQ0NjU2NCA4Ny40ODU1NDYyLDM1LjI0NDY1NjQgTDk3LjUxNjAxMDUsMjkuMTY5MTMzOSBaIiBpZD0iU2hhcGUtQ29weSI+PC9wYXRoPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+',
        //   'name': 'name11111',
        //   'description': 'des1111111',
        //   'author': '5ba36aa16e2ad051ddd0d4b1',
        //   'audio': 'http://developer.mozilla.org/@api/deki/files/2926/=AudioTest_(1).ogg',
        //   'copy': 'copy11111',
        //   'status': 3,
        //   'createTime': 1537949342,
        //   'updateTime': 1537949342,
        //   '__v': 0
        // }
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
      console.log(result)
      await Promise.all(promises)
      console.log(this.userMap)
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
