<template>
  <div class="search-suggestion">
    <van-cell
      icon="search"
      v-for="(text, index) in suggestions"
      :key="index"
      @click="$emit('search', text)"
    >
    <div slot="title" v-html="highlight(text)"></div>
    </van-cell>
  </div>
</template>

<script>
import { getSearchSuggestions } from '@/api/search'

// 按需加载的好处：只会把使用到的成员打包到结果中
// debounce 防抖函数
import { debounce } from 'lodash'

export default {
  name: 'SearchSuggestion',
  data() {
    return {
      suggestions: [] // 联想建议数据列表
    }
  },
  props: {
    searchText: {
      type: String,
      required: true
    }
  },
  watch: {
    searchText: {
      // handler(value) {
      //   // console.log(value)
      //   // 调用获取搜索联想建议的方法
      //   this.loadSearchSuggestions(value)
      // },

      // 回调函数防抖
      handler: debounce(function (value) {
        // console.log(value)
        // 调用获取搜索联想建议的方法
        this.loadSearchSuggestions(value)
      }, 200),
      // 搜索框输入内容之后，组件才渲染出来，才开始监听
      // 所以需要立即执行一次回调
      immediate: true
    }
  },
  computed: {},
  created() {},

  methods: {
    // 获取搜索联想建议的方法
    async loadSearchSuggestions(q) {
      try {
        const { data } = await getSearchSuggestions(q)
        // console.log(data)
        this.suggestions = data.data.options
      } catch (err) {
        this.$toast('数据获取失败，请稍后重试')
      }
    },
    // 高亮函数
    highlight(text) {
      const highlightStr = `<span class="active">${this.searchText}</span>`

      // 正则表达式 // 中间的内容都会当作匹配字符来使用，而不是数据变量
      // 如果想要根据数据变量动态的创建正则表达式，则手动 new RegExp
      // RegExp js原生的正则表达式构造函数
      //   参数一：匹配模式字符串，他会根据这个字符串创建正则对象
      //   参数二：匹配模式，要写到字符串中
      // g 全局匹配 i 不区分大小写
      const reg = new RegExp(this.searchText, 'gi')
      // text.replace(/this.searchText/gi, highlightStr)
      return text.replace(reg, highlightStr)
    }
  },

  components: {}
}
</script>

<style lang="less" scoped>
.search-suggestion {
  /deep/ span.active {
    color: #3296fa;
  }
}
</style>
