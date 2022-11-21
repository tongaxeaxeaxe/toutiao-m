<template>
  <div class="channel-edit">
    <van-cell :border="false">
      <div slot="title" class="title-text">我的频道</div>
      <van-button
        class="edit-btn"
        type="danger"
        plain
        round
        size="small"
        @click="isEdit = !isEdit"
        >{{ isEdit ? '完成' : '编辑' }}</van-button
      >
    </van-cell>
    <van-grid class="my-grid" :gutter="10">
      <van-grid-item
        class="grid-item"
        v-for="(channel, index) in myChannels"
        :key="index"
        @click="onMyChannelClick(channel, index)"
      >
        <van-icon
          v-show="isEdit && !fiexdChannels.includes(channel.id)"
          slot="icon"
          name="clear"
        ></van-icon>
        <span class="text" :class="{ active: index === active }" slot="text">{{
          channel.name
        }}</span>
      </van-grid-item>
    </van-grid>

    <!-- 频道推荐 -->
    <van-cell :border="false">
      <div slot="title" class="title-text">频道推荐</div>
    </van-cell>
    <van-grid class="recommend-grid" :gutter="10">
      <van-grid-item
        class="grid-item"
        v-for="(channel, index) in recommendChannels"
        :key="index"
        icon="plus"
        :text="channel.name"
        @click="onAddChannel(channel)"
      />
    </van-grid>
    <!-- /频道推荐 -->
  </div>
</template>

<script>
import { getAllChannels, addUserChannel, delUserChannel } from '@/api/channel'
import { mapState } from 'vuex'
// 导入操作本地存储的模块方法
import { setItem } from '@/utils/storage'

export default {
  name: 'ChannelEdit',
  data() {
    return {
      allChannels: [], // 所有频道
      isEdit: false, // 控制编辑状态的显示
      fiexdChannels: [0] // 固定频道，不允许删除
    }
  },
  computed: {
    // 把user映射过来
    ...mapState(['user']),

    recommendChannels() {
      // 数组的 filter 方法：遍历数组，把符合条件的元素存储到新数组中并返回
      return this.allChannels.filter((channel) => {
        // const channels = []

        // 数组的 find 方法：遍历数组，把符合条件的第1个元素返回
        return !this.myChannels.find((myChannel) => {
          return myChannel.id === channel.id
        })

        // return channels
      })

      //   const channels = []
      //   this.allChannels.forEach((channel) => {
      //     // find 遍历数组，找到满足条件的元素项
      //     const ret = this.myChannels.find((myChannel) => {
      //       return myChannel.id === channel.id
      //     })
      //     // const ret = this.myChannels.some((myChannel) => {
      //     //   return myChannel.id === channel.id
      //     // })

      //     // 如果我的频道中不包括该频道项，则收集到推荐频道中
      //     if (!ret) {
      //       channels.push(channel)
      //     }
      //   })

      //   // 把计算结果返回
      //   return channels
    },
    myChannelss() {
      return this.myChannels
    }
  },
  props: {
    myChannels: {
      type: Array,
      require: true
    },
    active: {
      type: Number,
      required: true
    }
  },
  created() {
    this.loadAllChannels()
  },

  methods: {
    async loadAllChannels() {
      try {
        const { data } = await getAllChannels()
        // console.log(data)
        this.allChannels = data.data.channels
      } catch (err) {
        this.$toast('数据获取失败')
      }
    },
    // 添加频道的方法
    async onAddChannel(channel) {
      this.myChannelss.push(channel)

      // 数据持家会处理
      if (this.user) {
        try {
          // 已登录，把数据请求接口放到线上
          await addUserChannel({
            id: channel.id, // 频道ID
            seq: this.myChannels.length // 序号
          })
        } catch (err) {
          this.$toast('保存失败，请稍后重试')
        }
      } else {
        // 未登录，把数据存储到本地
        setItem('TOUTISO_CHANNELS', this.myChannelss)
      }
    },
    // 删除频道的方法
    onMyChannelClick(channel, index) {
      // 只有点击了编辑按钮后才删除
      if (this.isEdit) {
        // 如果是固定频道，则不删除
        if (this.fiexdChannels.includes(channel.id)) {
          return
        }
        // 编辑状态，执行删除频道
        // 如果删除的是当前项前面的数据  让激活频道的索引 -1
        if (index <= this.active) {
          this.$emit('update-active', this.active - 1, true)
        }
        // 执行删除操作
        this.myChannelss.splice(index, 1)
      } else {
        // 非编辑状态，执行切换频道
        this.$emit('update-active', index, false)
      }

      // 处理持久化
      this.deleteChannel(channel)
    },
    // 处理持久化的方法
    async deleteChannel(channel) {
      try {
        if (this.user) {
          // 已登录，则将数据更新到线上
          await delUserChannel(channel.id)
        } else {
          // 为登录，将数据更新到本地
          setItem('TOUTISO_CHANNELS', this.myChannelss)
        }
      } catch (err) {
        this.$toast('操作失败，请稍后重试')
      }
    }
  },

  components: {}
}
</script>

<style lang="less" scoped>
.channel-edit {
  padding: 85px 0;

  .title-text {
    font-size: 32px;
    color: #333;
  }

  .edit-btn {
    width: 104px;
    height: 48px;
    font-size: 26px;
    color: #f85959;
    border: 1px solid #f85959;
  }

  /deep/ .grid-item {
    width: 160px;
    height: 86px;
    .van-grid-item__content {
      // 强制一行显示
      white-space: nowrap;
      background-color: #f4f5f6;
      .van-grid-item__text,
      .text {
        font-size: 28px;
        color: #222;
        margin-top: 0;
      }
      .active {
        color: red;
      }
      .van-grid-item__icon-wrapper {
        position: unset;
      }
    }
  }

  /deep/ .my-grid {
    .grid-item {
      .van-icon-clear {
        position: absolute;
        right: -10px;
        top: -10px;
        font-size: 30px;
        color: #cacaca;
        z-index: 2;
      }
    }
  }

  /deep/ .recommend-grid {
    .grid-item {
      .van-grid-item__content {
        flex-direction: row;
        .van-icon-plus {
          font-size: 28px;
          margin-right: 6px;
        }
        .van-grid-item__text {
          margin-top: 0;
        }
      }
    }
  }
}
</style>
