<template>
  <div class="article-container">
    <!-- 导航栏 -->
    <van-nav-bar
      class="page-nav-bar"
      left-arrow
      @click-left="$router.back()"
      title="黑马头条"
    ></van-nav-bar>
    <!-- /导航栏 -->

    <div class="main-wrap">
      <!-- 加载中 -->
      <div v-if="loading" class="loading-wrap">
        <van-loading color="#3296fa" vertical>加载中</van-loading>
      </div>
      <!-- /加载中 -->

      <!-- 加载完成-文章详情 -->
      <div v-else-if="article.title" class="article-detail">
        <!-- 文章标题 -->
        <h1 class="article-title">{{ article.title }}</h1>
        <!-- /文章标题 -->

        <!-- 用户信息 -->
        <van-cell class="user-info" center :border="false">
          <van-image
            class="avatar"
            slot="icon"
            round
            fit="cover"
            :src="article.aut_photo"
          />
          <div slot="title" class="user-name">{{ article.aut_name }}</div>
          <div slot="label" class="publish-date">{{ article.pubdate }}</div>
          <!-- <div slot="label" class="publish-date">{{ article.pubdate | relativeTime }}</div> -->
          <!--
            模板中的 $event 是事件参数
            方法中的 $event 是事件对象
            当我们传递给子组件的数据纪要使用还要修改。
              传递：props
               :is-followed="article.is_followed"
              修改：自定义事件
               @update-is_followed="article.is_followed = $event"
            简写方式：在组件上使用 v-model
              相当于：
                :value="article.is_followed"
                @input="article.is_followed = $event"

            如果需要修改 v-model 的规则名称，可以通过子组件的 model 属性来配置修改

            一个组件上只能使用一次 v-model
            如果有多个数据需要实现类似于 v-model 的效果，咋办？
            可以使用属性的 .sync 修饰符
           -->
          <!-- 关注取消关注按钮单独封装成组件 -->
          <follow-user
            class="follow-btn"
            v-model="article.is_followed"
            :user-id="article.aut_id"
          ></follow-user>
          <!-- <van-button
            v-if="article.is_followed"
            class="follow-btn"
            round
            size="small"
            :loading="followLoading"
            @click="onFollow"
            >已关注</van-button
          >
          <van-button
            v-else
            class="follow-btn"
            type="info"
            color="#3296fa"
            round
            size="small"
            icon="plus"
            :loading="followLoading"
            @click="onFollow"
            >关注</van-button
          > -->
        </van-cell>
        <!-- /用户信息 -->

        <!-- 文章内容 -->
        <div
          class="article-content markdown-body"
          v-html="article.content"
          ref="article-content"
        ></div>
        <van-divider>正文结束</van-divider>
        <!-- 文章评论列表的组件 -->
        <CommentList
          :source="article.art_id"
          :lists="commentList"
          @onload-success="totalComentCount = $event.total_count"
          @reply-click="onReplayClick"
        ></CommentList>

        <!-- 加载完成之后才显示底部区域 -->
        <!-- 底部区域 -->
        <div class="article-bottom">
          <van-button
            class="comment-btn"
            type="default"
            round
            size="small"
            @click="isPostShow = true"
            >写评论</van-button
          >
          <van-icon name="comment-o" :info="totalComentCount" color="#777" />
          <!-- 把收藏图标封装成组件 -->
          <CollectArticle
            v-model="article.is_collected"
            :article-id="article.art_id"
          ></CollectArticle>
          <!-- <van-icon color="#777" name="star-o" /> -->
          <!-- 把点赞图标封装成组件 -->
          <LikeArticle
            v-model="article.attitude"
            :article-id="article.art_id"
          ></LikeArticle>
          <!-- <van-icon color="#777" name="good-job-o" /> -->
          <van-icon name="share" color="#777777"></van-icon>
        </div>
        <!-- /底部区域 -->

        <!-- 发布评论的弹出层 -->
        <van-popup v-model="isPostShow" position="bottom">
          <CommentPost
            :target="article.art_id"
            @post-success="onPostSuccess"
          ></CommentPost>
        </van-popup>
      </div>
      <!-- /加载完成-文章详情 -->

      <!-- 加载失败：404 -->
      <div v-else-if="errStatus === 404" class="error-wrap">
        <van-icon name="failure" />
        <p class="text">该资源不存在或已删除！</p>
      </div>
      <!-- /加载失败：404 -->

      <!-- 加载失败：其它未知错误（例如网络原因或服务端异常） -->
      <div v-else class="error-wrap">
        <van-icon name="failure" />
        <p class="text">内容加载失败！</p>
        <van-button class="retry-btn" @click="loadArticle">点击重试</van-button>
      </div>
      <!-- /加载失败：其它未知错误（例如网络原因或服务端异常） -->
    </div>

    <!-- 评论回复的弹出层 -->
    <!-- 弹出层是懒渲染的，只有在第一次展示的时候才会渲染里面的内容，后面的关闭和再打开只是把里面的内容显示和隐藏 -->
    <!-- 这里要给里面的组件v-if绑定 isReplyShow  -->
    <van-popup v-model="isReplyShow" position="bottom" style="height: 100%">
      <CommentReply
        v-if="isReplyShow"
        :comment="currentComment"
        @close="isReplyShow = false"
      ></CommentReply>
    </van-popup>
    <!-- /评论回复 -->
  </div>
</template>

<script>
import { getArticleById } from '@/api/article'
// 图片预览
import { ImagePreview } from 'vant'
// import { addFollow, deleteFollow } from '@/api/user'
// 引入关注取消关注的图标组件
import FollowUser from '@/components/follow-user/index-follow.vue'
// 引入收藏图标的组件
import CollectArticle from '@/components/collect-article/index-collect.vue'
// 引入点赞图标的组件
import LikeArticle from '@/components/like-article/index-like.vue'
// 引入评论项的组件
import CommentList from './components/comment-list'
// 引入发布评论的组件
import CommentPost from './components/comment-post.vue'
// 引入评论回复弹出层里结构的组件
import CommentReply from './components/comment-reply'

// 进入图片预览
// ImagePreview({
//   // 预览的图片数组
//   images: [
//     'https://img01.yzcdn.cn/vant/apple-1.jpg',
//     'https://img01.yzcdn.cn/vant/apple-2.jpg'
//   ],
//   // 起始位置 从0开始
//   startPosition: 1,
//   onClose() {
//     this.$toast('关闭')
//   }
// })

export default {
  name: 'ArticleIndex',
  components: {
    FollowUser,
    CollectArticle,
    LikeArticle,
    CommentList,
    CommentPost,
    CommentReply
  },
  // 依赖注入
  // 给所有的后代组件提供数据
  provide() {
    // 使用函数的形式，可以访问到 `this`
    return {
      articleId: this.articleId
    }
  },
  props: {
    articleId: {
      type: [Number, String, Object],
      required: true
    }
  },
  data() {
    return {
      article: {}, // 文章详情
      loading: true, // 加载中的 loading 状态
      errStatus: 0, // 失败的状态码
      followLoading: false, // 防止重复点击关注取消关注
      totalComentCount: 0, // 评论的数量
      isPostShow: false, // 控制发布评论的显示状态
      commentList: [],
      isReplyShow: false, // 控制评论回复的显示状态
      currentComment: {} // 当前点击回复的评论项
    }
  },
  computed: {},
  watch: {},
  created() {
    this.loadArticle()
  },
  mounted() {},
  methods: {
    // 发起ajax请求获取文章详情的方法
    async loadArticle() {
      // 先打开loading，显示加载中的视图
      this.loading = true

      try {
        const { data } = await getArticleById(this.articleId)
        // console.log(data)

        // 模拟数据加载失败
        // if (Math.random() > 0.5) {
        //   JSON.parse('hklkljkl')
        // }

        // 把拿到的结果赋值给article
        this.article = data.data

        // 初始化图片点击预览
        // 数据驱动视图不是立即的
        // console.log(this.$refs['article-content'])
        // this.$nextTick(() => {
        //   console.log('11')
        //   console.log(this.$refs['article-content'])
        // })
        setTimeout(() => {
          // console.log(this.$refs['article-content'])
          // 处理文章内容的img节点
          this.previewImage()
        }, 0)

        // 请求成功，关闭loading
        // this.loading = false
      } catch (err) {
        if (err.response && err.response.status === 404) {
          this.errStatus = 404
        }
        // this.loading = false
        console.log(err)
      }

      // 无论成功还是失败，都需要关闭loading 关闭加载中的视图
      this.loading = false
    },

    // 处理文章内容的img节点
    previewImage() {
      // 先拿到article-content的DOM节点，再得到所有的 img 节点
      const articleContent = this.$refs['article-content']
      const imgs = articleContent.querySelectorAll('img')
      // console.log(imgs)
      // 获取所有 img 地址
      const images = []

      imgs.forEach((img, index) => {
        images.push(img.src)
        // 给每一个img节点绑定单击事件，在函数中调用预览
        img.onclick = () => {
          // 进入图片预览
          ImagePreview({
            // 预览的图片数组
            images: images,
            // 起始位置 从0开始
            startPosition: index
          })
        }
      })
      // console.log(images)
    },

    // 关注和取消关注的请求
    // async onFollow() {
    //   this.followLoading = true // 展示关注按钮的 loading 状态
    //   try {
    //     if (this.article.is_followed) {
    //       // 已关注，取消关注
    //       await deleteFollow(this.article.aut_id)
    //       // this.article.is_followed = false
    //     } else {
    //       // 没有关注，添加关注
    //       await addFollow(this.article.aut_id)
    //       // this.article.is_followed = false
    //     }

    //     // 更新视图
    //     this.article.is_followed = !this.article.is_followed
    //   } catch (err) {
    //     let message = ''
    //     if (err.response && err.response.status === 400) {
    //       message = '你不能关注你自己！'
    //     }
    //     this.$toast(message)
    //   }
    //   this.followLoading = false // 关闭关注按钮的 loading 状态
    // }

    onPostSuccess(data) {
      // 关闭弹出层
      this.isPostShow = false

      // 将发布内容显示到列表顶部
      this.commentList.unshift(data.new_obj)
    },

    // 接收到子组件的子组件comment-item传过来的值
    onReplayClick(comment) {
      // console.log(comment)
      // 把评论项的信息comment存储起来，传递给评论内容结构的子组件
      this.currentComment = comment

      // 显示评论回复弹出层
      this.isReplyShow = true
    }
  }
}
</script>

<style scoped lang="less">
// github上处理文章风格的样式文件
@import './github-markdown';

.article-container {
  .main-wrap {
    position: fixed;
    left: 0;
    right: 0;
    top: 92px;
    bottom: 88px;
    overflow-y: scroll;
    background-color: #fff;
  }
  .article-detail {
    .article-title {
      font-size: 40px;
      padding: 50px 32px;
      margin: 0;
      color: #3a3a3a;
    }

    .user-info {
      padding: 0 32px;
      .avatar {
        width: 70px;
        height: 70px;
        margin-right: 17px;
      }
      .van-cell__label {
        margin-top: 0;
      }
      .user-name {
        font-size: 24px;
        color: #3a3a3a;
      }
      .publish-date {
        font-size: 23px;
        color: #b7b7b7;
      }
      .follow-btn {
        width: 170px;
        height: 58px;
      }
    }

    .article-content {
      padding: 55px 32px;
      /deep/ p {
        text-align: justify;
      }
    }
  }

  .loading-wrap {
    padding: 200px 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
  }

  .error-wrap {
    padding: 200px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    .van-icon {
      font-size: 122px;
      color: #b4b4b4;
    }
    .text {
      font-size: 30px;
      color: #666666;
      margin: 33px 0 46px;
    }
    .retry-btn {
      width: 280px;
      height: 70px;
      line-height: 70px;
      border: 1px solid #c3c3c3;
      font-size: 30px;
      color: #666666;
    }
  }

  .article-bottom {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: space-around;
    align-items: center;
    box-sizing: border-box;
    height: 88px;
    border-top: 1px solid #d8d8d8;
    background-color: #fff;
    .comment-btn {
      width: 282px;
      height: 46px;
      border: 2px solid #eeeeee;
      font-size: 30px;
      line-height: 46px;
      color: #a7a7a7;
    }
    .van-icon {
      font-size: 40px;
      .van-info {
        font-size: 16px;
        background-color: #e22829;
      }
    }
  }
}
</style>
