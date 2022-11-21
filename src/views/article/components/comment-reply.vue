<template>
  <div class="comment-reply">
    <van-nav-bar
      :title="
        comment.reply_count > 0 ? `${comment.reply_count}条回复` : '暂无回复'
      "
    >
      <!-- <van-icon slot="left" name="cross" /> -->
      <template v-slot:left>
        <van-icon name="cross" @click="$emit('close')" />
      </template>
    </van-nav-bar>

    <div class="scroll-wrap">
      <!-- 当前的评论项 -->
      <CommentItem :comment="comment"></CommentItem>
      <!-- /当前的评论项 -->

      <!-- 评论的回复列表 -->
      <van-cell title="全部回复"></van-cell>
      <!-- 评论的回复列表，和评论列表的结构和样式相同，把封装的组件拿过来复用 -->
      <CommentList
        :lists="commentList"
        :source="comment.com_id"
        type="c"
      ></CommentList>
      <!-- /评论的回复列表 -->
    </div>

    <!-- 发布回复的评论 -->
    <div class="post-wrap">
      <van-button class="post-btn" size="small" round @click="isPostShow = true"
        >写评论</van-button
      >
    </div>

    <van-popup v-model="isPostShow" position="bottom">
      <CommentPost
        :target="comment.com_id"
        @post-success="onPostSuccess"
      ></CommentPost>
    </van-popup>
    <!-- /发布回复的评论 -->
  </div>
</template>

<script>
import CommentItem from './comment-item.vue'
import CommentList from './comment-list.vue'
import CommentPost from './comment-post.vue'

export default {
  name: 'CommentReply',
  components: {
    CommentItem,
    CommentList,
    CommentPost
  },
  props: {
    comment: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isPostShow: false,
      commentList: [] // 评论的回复列表
    }
  },
  computed: {
    comments() {
      return this.comment
    }
  },
  watch: {},
  created() {},
  mounted() {},
  methods: {
    onPostSuccess(data) {
      // console.log(data)
      // 更新回复的数量
      this.comments.reply_count++
      // 关闭弹层
      this.isPostShow = false
      // 将最新回复的内容展示到列表的顶部
      // 从子组件comment-post中拿到数据去修改子组件comment-list的数组
      this.commentList.unshift(data.new_obj)
    }
  }
}
</script>

<style lang="less" scoped>
.scroll-wrap {
  position: fixed;
  top: 92px;
  left: 0;
  right: 0;
  bottom: 88px;
  // overflow: hidden;
  // 溢出滚动
  overflow-y: auto;
}
.post-wrap {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 88px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border-top: 1px solid #d8d8d8;
  .post-btn {
    width: 60%;
  }
}
</style>
