<template>
  <div class="search-history">
    <van-cell title="搜索历史">
      <div v-if="isDeleteShow">
        <span @click="$emit('clear-search-histories')">全部删除</span>
        &nbsp;&nbsp;
        <span @click="isDeleteShow = false">完成</span>
      </div>
      <van-icon v-else name="delete" @click="isDeleteShow = true"></van-icon>
    </van-cell>
    <!-- 每条搜索记录 -->
    <van-cell
      :title="item"
      v-for="(item, index) in searchHistories"
      :key="index"
      @click="onSearchItemClick(item, index)"
    >
      <!-- 每条搜索记录右侧的删除图标 -->
      <van-icon v-show="isDeleteShow" name="close"></van-icon>
    </van-cell>
  </div>
</template>

<script>
export default {
  name: 'SearchHistory',
  data() {
    return {
      isDeleteShow: false // 控制删除显示状态
      // searchHistoriess: this.searchHistories
    }
  },
  // prop 数据
  //   普通数据不能修改，即便改了也不会传导给父组件
  //   引用数据（数组,对象），可以修改，不可以直接赋值
  props: {
    searchHistories: {
      type: Array,
      required: true
    }
  },
  computed: {
    searchHistoriess() {
      return this.searchHistories
    }
  },
  created() {},

  methods: {
    onSearchItemClick(item, index) {
      if (this.isDeleteShow) {
        // 删除状态，删除历史记录数据
        this.searchHistoriess.splice(index, 1)
      } else {
        // 非删除状态，直接进入搜索
        this.$emit('search', item)
      }
    }
  },

  components: {}
}
</script>

<style lang="less" scoped></style>
