<template>
  <div class="user-profile">
    <!-- 导航栏 -->
    <van-nav-bar
      title="个人信息"
      class="page-nav-bar"
      left-arrow
      @click-left="$router.back()"
    ></van-nav-bar>
    <!-- /导航栏 -->

    <input type="file" hidden ref="file" @change="onFileChange" />

    <!-- 个人信息 -->
    <!-- 单元格 -->
    <van-cell title="头像" is-link center @click="$refs.file.click()">
      <van-image class="avatar" fit="cover" round :src="user.photo" />
    </van-cell>
    <van-cell
      title="昵称"
      :value="user.name"
      is-link
      @click="isUpdateNameShow = true"
    ></van-cell>
    <van-cell
      title="性别"
      :value="user.gender === 0 ? '男' : '女'"
      is-link
      @click="isUpdateGenderShow = true"
    ></van-cell>
    <van-cell
      title="生日"
      :value="user.birthday"
      is-link
      @click="isUpdateBirthdayShow = true"
    ></van-cell>
    <!-- /个人信息 -->

    <!-- 编辑昵称的弹出层 -->
    <van-popup
      v-model="isUpdateNameShow"
      style="height: 100%"
      position="bottom"
    >
      <UpdateName
        v-if="isUpdateNameShow"
        v-model="user.name"
        @close="isUpdateNameShow = false"
      ></UpdateName>
    </van-popup>
    <!-- /编辑昵称的弹出层 -->

    <!-- 编辑性别的弹出层 -->
    <van-popup v-model="isUpdateGenderShow" position="bottom">
      <UpdateGender
        v-if="isUpdateGenderShow"
        v-model="user.gender"
        @close="isUpdateGenderShow = false"
      ></UpdateGender>
    </van-popup>
    <!-- /编辑性别的弹出层 -->

    <!-- 编辑生日的弹出层 -->
    <van-popup v-model="isUpdateBirthdayShow" position="bottom">
      <UpdateBirthday
        v-if="isUpdateBirthdayShow"
        v-model="user.birthday"
        @close="isUpdateBirthdayShow = false"
      ></UpdateBirthday>
    </van-popup>
    <!-- /编辑生日的弹出层 -->

    <!-- 编辑头像的弹出层 -->
    <van-popup
      v-model="isUpdatePhotoShow"
      position="bottom"
      style="height: 100%"
    >
      <UpdatePhoto
        v-if="isUpdatePhotoShow"
        :img="img"
        @close="isUpdatePhotoShow = false"
        @update-photo="user.photo = $event"
      ></UpdatePhoto>
    </van-popup>
    <!-- /编辑头像的弹出层 -->
  </div>
</template>

<script>
import { getUserProfile } from '@/api/user'
// 引入更新昵称的组件
import UpdateName from './components/update-name.vue'
// 引入更新性别的组件
import UpdateGender from './components/update-gender.vue'
// 引入更新生日的组件
import UpdateBirthday from './components/update-birthday.vue'
// 引入更新头像的组件
import UpdatePhoto from './components/update-photo.vue'

export default {
  name: 'UserProfile',
  components: {
    UpdateName,
    UpdateGender,
    UpdateBirthday,
    UpdatePhoto
  },
  props: {},
  data() {
    return {
      user: {}, // 用户个人资料信息
      isUpdateNameShow: false,
      isUpdateGenderShow: false,
      isUpdateBirthdayShow: false,
      isUpdatePhotoShow: false,
      img: null // 预览的图片
    }
  },
  computed: {},
  watch: {},
  created() {
    this.loadUserProfile()
  },
  mounted() {},
  methods: {
    async loadUserProfile() {
      try {
        const { data } = await getUserProfile()
        console.log(data)
        this.user = data.data
      } catch (err) {
        this.$toast('获取个人资料失败')
      }
    },
    onFileChange() {
      // 获取文件对象
      const file = this.$refs.file.files[0]
      // 基于文件对象获取 blob 数据
      const data = window.URL.createObjectURL(file)
      // console.log(data)
      this.img = data

      // 弹出展示图片的弹出层
      this.isUpdatePhotoShow = true

      // file-input 如果选了同一个文件不会触发change事件
      // 解决办法就是每次使用完毕，把他的 value 清空
      this.$refs.file.value = ''
    }
  }
}
</script>

<style lang="less" scoped>
.user-profile {
  .avatar {
    width: 60px;
    height: 60px;
  }

  .van-popup {
    background-color: #f5f7f9;
  }
}
</style>
