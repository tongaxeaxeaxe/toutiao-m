<template>
  <div class="article-list">
    <!-- 文章列表组件 -->
    <van-pull-refresh
      v-model="isFreshLoading"
      :success-text="refreshSuccessText"
      :success-duration="1000"
      @refresh="onRefresh"
    >
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        :error.sync="error"
        error-text="请求失败，点击重新加载"
        @load="onLoad"
      >
        <!-- 调用子组件 -->
        <article-item
          v-for="(article, index) in list"
          :key="index"
          :article="article"
        ></article-item>
        <!-- <van-cell
          v-for="(article, index) in list"
          :key="index"
          :title="article.title"
        /> -->
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import { getArticles } from '@/api/article'
import ArticleItem from '@/components/article-item'

export default {
  name: 'ArticleList',
  data() {
    return {
      list: [], // 存储列表数据的数组
      loading: false, // 控制加载中 loading 状态
      finished: false, // 控制数据加载结束的状态
      timestamp: null, // 请求获取下一页数据的时间戳
      error: false, // 控制列表加载失败的提示状态
      isFreshLoading: false, // 控制下拉刷新的状态
      refreshSuccessText: '刷新成功' // 下拉刷新成功提示文本
    }
  },
  props: {
    channel: {
      type: Object,
      require: true
    }
  },
  created() {},

  methods: {
    // 上拉加载
    async onLoad() {
      try {
        const { data } = await getArticles({
          channel_id: this.channel.id, // 频道ID
          // timestamp 简单理解就是请求数据的页码
          // 请求第1页数据，当前最新时间戳
          // 用于请求之后数据的时间戳会在当前请求结果中返回给你
          timestamp: this.timestamp || Date.now()
        })

        // 模拟随机失败的情况
        // if (Math.random() > 0.5) {
        //   JSON.parse('sdgsdg')
        // }

        // console.log(data)
        // 把请求的结果放到 list 数组中
        const { results } = data.data
        this.list.push(...results)

        // 本次加载结束 把加载状态结束
        this.loading = false

        // 判断数据是否加载完成
        if (results.length) {
          // 更新获取下一页数据的时间戳
          this.timestamp = data.data.pre_timestamp
        } else {
          // 没有数据了，将 finished 设置为 true，不再加载更多
          this.finished = true
        }
      } catch (err) {
        // 展示错误提示状态
        this.error = true

        // 请求失败把加载状态结束
        this.loading = false
      }
    },

    // 触发下拉刷新的时候回触发调用该函数
    async onRefresh() {
      try {
        // 请求获取数据
        const { data } = await getArticles({
          channel_id: this.channel.id, // 频道ID
          // 下拉刷新，每次请求获取最新的时间戳
          timestamp: Date.now()
        })

        // 将数据追加到列表的顶部
        const { results } = data.data
        this.list.unshift(...results)

        // 关闭下拉刷新的 loading 状态
        this.isFreshLoading = false

        // 更新下拉刷新成功提示的文本
        this.refreshSuccessText = `刷新成功，更新了${results.length}条数据`
      } catch (err) {
        this.isFreshLoading = false
        // 更新下拉刷新失败提示的文本
        this.refreshSuccessText = '刷新失败'
      }
    }
  },

  components: {
    ArticleItem
  },

  computed: {}
}
</script>

<style lang="less" scoped>
.article-list {
  height: 79vh;
  overflow-y: auto;
}
</style>
