<template>
  <van-icon
    color="#777"
    :name="value === 1 ? 'good-job' : 'good-job-o'"
    :class="{ liked: value === 1 }"
    :loading="loading"
    @click="onCollect"
  />
</template>

<script>
import { addLike, deleteLike } from '@/api/article'

export default {
  name: 'LikeArticle',
  components: {},
  props: {
    value: {
      type: Number,
      required: true
    },
    articleId: {
      type: [Number, String, Object],
      required: true
    }
  },
  data() {
    return {
      loading: false
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    async onCollect() {
      // 展示 loading 状态
      this.loading = true
      // 发起ajax请求
      try {
        let status = -1 // 定义一个点赞的状态
        if (this.value === 1) {
          // 已点赞，取消点赞
          await deleteLike(this.articleId)
        } else {
          // 没有点赞，添加点赞
          await addLike(this.articleId)
          status = 1
        }
        // 更新视图
        this.$emit('input', status)
        this.$toast.success(status === 1 ? '点赞成功' : '取消点赞成功')
      } catch (err) {
        console.log(err)
        this.$toast.fail('操作失败，请重试！')
      }

      // 展示 loading 状态
      this.loading = true
    }
  }
}
</script>

<style lang="less" scoped>
.liked {
  color: #e5645f !important;
}
</style>
