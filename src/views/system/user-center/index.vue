<template>
  <div class="page-content user">
    <div class="content">
      <div class="left-wrap">
        <div class="user-wrap box-style">
          <img class="bg" src="@imgs/user/bg.webp" />
          <img class="avatar" :src="userInfo.avatar_url" />
          <h2 class="name">{{ userInfo.name }}</h2>
          <p class="des">元气满满的一天</p>

          <div class="outer-info">
            <div>
              <i class="iconfont-sys">&#xe72e;</i>
              <span>{{ userInfo.email }}</span>
            </div>
            <div>
              <i class="iconfont-sys">&#xe608;</i>
              <span>{{ userInfo.phone_number }}</span>
            </div>
            <div>
              <i class="iconfont-sys">&#xe736;</i>
              <span>{{ userInfo.role_name }}</span>
            </div>
            <!-- <div>
              <i class="iconfont-sys">&#xe811;</i>
              <span>{{ userInfo.department }}</span>
            </div> -->
          </div>

          <!-- <div class="lables">
            <h3>标签</h3>
            <div>
              <div v-for="item in lableList" :key="item">
                {{ item }}
              </div>
            </div>
          </div> -->
        </div>

        <!-- <el-carousel class="gallery" height="160px"
          :interval="5000"
          indicator-position="none"
        >
          <el-carousel-item class="item" v-for="item in galleryList" :key="item">
            <img :src="item"/>
          </el-carousel-item>
        </el-carousel> -->
      </div>
      <div class="right-wrap">
        <div class="info box-style">
          <h1 class="title">基本设置</h1>

          <ElForm
            :model="form"
            class="form"
            ref="ruleFormRef"
            :rules="rules"
            label-width="86px"
            label-position="top"
          >
            <ElRow>
              <ElFormItem label="姓名" prop="realName">
                <el-input v-model="form.name" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem label="性别" prop="sex" class="right-input">
                <ElSelect v-model="form.gender" placeholder="Select" :disabled="!isEdit">
                  <ElOption
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem label="昵称" prop="nikeName">
                <ElInput v-model="form.nickname" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem label="邮箱" prop="email" class="right-input">
                <ElInput v-model="form.email" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem label="手机" prop="mobile">
                <ElInput v-model="form.phone_number" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <div class="el-form-item-right">
              <ElButton v-if="isEdit" @click="cancelEdit" style="margin-right: 10px">
                取消
              </ElButton>
              <ElButton type="primary" style="width: 90px" v-ripple @click="edit">
                {{ isEdit ? '保存' : '编辑' }}
              </ElButton>
            </div>
          </ElForm>
        </div>

        <div class="info box-style" style="margin-top: 20px">
          <h1 class="title">更改密码</h1>

          <ElForm :model="pwdForm" class="form" label-width="86px" label-position="top">
            <!-- <ElFormItem label="当前密码" prop="password">
              <ElInput
                v-model="pwdForm.password"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem> -->

            <ElFormItem v-show="isEditPwd" label="新密码" prop="newPassword">
              <ElInput
                v-model="pwdForm.newPassword"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <ElFormItem v-show="isEditPwd" label="确认新密码" prop="confirmPassword">
              <ElInput
                v-model="pwdForm.confirmPassword"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <div class="el-form-item-right">
              <ElButton v-if="isEditPwd" @click="cancelEditPwd" style="margin-right: 10px">
                取消
              </ElButton>
              <ElButton type="primary" style="width: 90px" v-ripple @click="editPwd">
                {{ isEditPwd ? '保存' : '编辑' }}
              </ElButton>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '@/store/modules/user'
  import { ElForm, FormInstance, FormRules, ElMessage } from 'element-plus'
  import { UserService } from '@/api/usersApi'

  defineOptions({ name: 'UserCenter' })

  const userStore = useUserStore()
  const userInfo = computed(() => userStore.getUserInfo)

  const isEdit = ref(false)
  const isEditPwd = ref(false)
  const date = ref('')
  const form = reactive({
    nickname: userInfo.value.nickname || '',
    name: userInfo.value.name || '',
    email: userInfo.value.email || '',
    phone_number: userInfo.value.phone_number || '',
    gender: userInfo.value.gender_code || ''
  })

  const pwdForm = reactive({
    newPassword: '123456',
    confirmPassword: '123456'
  })

  const ruleFormRef = ref<FormInstance>()

  const rules = reactive<FormRules>({
    name: [
      { required: true, message: '请输入昵称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 30 个字符', trigger: 'blur' }
    ],
    nikename: [
      { required: true, message: '请输入昵称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 30 个字符', trigger: 'blur' }
    ],
    email: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
    phone_number: [{ required: true, message: '请输入手机号码', trigger: 'blur' }],
    address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
    gender: [{ type: 'array', required: true, message: '请选择性别', trigger: 'blur' }]
  })

  const options = [
    {
      value: 'F',
      label: '男'
    },
    {
      value: 'M',
      label: '女'
    }
  ]

  //const lableList: Array<string> = ['专注设计', '很有想法', '辣~', '大长腿', '川妹子', '海纳百川']

  onMounted(() => {
    getDate()
  })

  const getDate = () => {
    const d = new Date()
    const h = d.getHours()
    let text = ''

    if (h >= 6 && h < 9) {
      text = '早上好'
    } else if (h >= 9 && h < 11) {
      text = '上午好'
    } else if (h >= 11 && h < 13) {
      text = '中午好'
    } else if (h >= 13 && h < 18) {
      text = '下午好'
    } else if (h >= 18 && h < 24) {
      text = '晚上好'
    } else if (h >= 0 && h < 6) {
      text = '很晚了，早点睡'
    }

    date.value = text
  }

  // 完善编辑函数
  const edit = async () => {
    // 如果当前是编辑状态，点击按钮表示要保存
    if (isEdit.value) {
      // 表单验证
      if (!ruleFormRef.value) return

      try {
        // 验证表单
        await ruleFormRef.value.validate()

        // 调用API更新用户信息
        await UserService.updateCurrentUser(form)

        // 更新用户信息到store
        userStore.setUserInfo({
          ...userInfo.value,
          ...form
        })

        ElMessage.success('用户信息更新成功')
        isEdit.value = false
      } catch (error) {
        console.error('表单验证失败:', error)
        ElMessage.error('请检查表单填写是否正确')
      }
    } else {
      // 进入编辑状态
      isEdit.value = true
    }
  }

  // 取消编辑个人信息
  const cancelEdit = () => {
    // 重置表单数据为原始值
    form.nickname = userInfo.value.nickname || ''
    form.name = userInfo.value.name || ''
    form.email = userInfo.value.email || ''
    form.phone_number = userInfo.value.phone_number || ''
    form.gender = userInfo.value.gender_code || ''

    // 退出编辑状态
    isEdit.value = false
  }

  // 完善密码修改函数
  const editPwd = async () => {
    // 如果当前是编辑状态，点击按钮表示要保存
    if (isEditPwd.value) {
      // 简单的密码验证
      if (!pwdForm.newPassword || !pwdForm.confirmPassword) {
        ElMessage.error('请填写所有密码字段')
        return
      }

      // 验证新密码和确认密码是否一致
      if (pwdForm.newPassword !== pwdForm.confirmPassword) {
        ElMessage.error('新密码和确认密码不一致')
        return
      }

      // 验证密码长度
      if (pwdForm.newPassword.length < 6) {
        ElMessage.error('密码长度不能少于6位')
        return
      }

      try {
        // 调用API修改密码
        await UserService.updateUser(
          {
            password: pwdForm.newPassword
          },
          userInfo.value.user_id as number
        )
        ElMessage.success('密码修改成功')
        isEditPwd.value = false

        // 重置密码表单
        Object.assign(pwdForm, {
          password: '',
          newPassword: '',
          confirmPassword: ''
        })
      } catch (error) {
        console.error('密码修改失败:', error)
        ElMessage.error('密码修改失败，请重试')
      }
    } else {
      // 进入编辑状态
      isEditPwd.value = true

      // 重置密码表单
      Object.assign(pwdForm, {
        password: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  }

  // 取消密码修改
  const cancelEditPwd = () => {
    // 重置密码表单
    Object.assign(pwdForm, {
      password: '',
      newPassword: '',
      confirmPassword: ''
    })

    // 退出编辑状态
    isEditPwd.value = false
  }
</script>

<style lang="scss">
  .user {
    .icon {
      width: 1.4em;
      height: 1.4em;
      overflow: hidden;
      vertical-align: -0.15em;
      fill: currentcolor;
    }
  }
</style>

<style lang="scss" scoped>
  .page-content {
    width: 100%;
    height: 100%;
    padding: 0 !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;

    $box-radius: calc(var(--custom-radius) + 4px);

    .box-style {
      border: 1px solid var(--art-border-color);
    }

    .content {
      position: relative;
      display: flex;
      justify-content: space-between;
      margin-top: 10px;

      .left-wrap {
        width: 450px;
        margin-right: 25px;

        .user-wrap {
          position: relative;
          height: 600px;
          padding: 35px 40px;
          overflow: hidden;
          text-align: center;
          background: var(--art-main-bg-color);
          border-radius: $box-radius;

          .bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 200px;
            object-fit: cover;
          }

          .avatar {
            position: relative;
            z-index: 10;
            width: 80px;
            height: 80px;
            margin-top: 120px;
            object-fit: cover;
            border: 2px solid #fff;
            border-radius: 50%;
          }

          .name {
            margin-top: 20px;
            font-size: 22px;
            font-weight: 400;
          }

          .des {
            margin-top: 20px;
            font-size: 14px;
          }

          .outer-info {
            width: 300px;
            margin: auto;
            margin-top: 30px;
            text-align: left;

            > div {
              margin-top: 10px;

              span {
                margin-left: 8px;
                font-size: 14px;
              }
            }
          }

          .lables {
            margin-top: 40px;

            h3 {
              font-size: 15px;
              font-weight: 500;
            }

            > div {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              margin-top: 15px;

              > div {
                padding: 3px 6px;
                margin: 0 10px 10px 0;
                font-size: 12px;
                background: var(--art-main-bg-color);
                border: 1px solid var(--art-border-color);
                border-radius: 2px;
              }
            }
          }
        }

        .gallery {
          margin-top: 25px;
          border-radius: 10px;

          .item {
            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
        }
      }

      .right-wrap {
        flex: 1;
        overflow: hidden;
        border-radius: $box-radius;

        .info {
          background: var(--art-main-bg-color);
          border-radius: $box-radius;

          .title {
            padding: 15px 25px;
            font-size: 20px;
            font-weight: 400;
            color: var(--art-text-gray-800);
            border-bottom: 1px solid var(--art-border-color);
          }

          .form {
            box-sizing: border-box;
            padding: 30px 25px;

            > .el-row {
              .el-form-item {
                width: calc(50% - 10px);
              }

              .el-input,
              .el-select {
                width: 100%;
              }
            }

            .right-input {
              margin-left: 20px;
            }

            .el-form-item-right {
              display: flex;
              align-items: center;
              justify-content: end;

              .el-button {
                width: 110px !important;
              }
            }
          }
        }
      }
    }
  }

  @media only screen and (max-width: $device-ipad-vertical) {
    .page-content {
      .content {
        display: block;
        margin-top: 5px;

        .left-wrap {
          width: 100%;
        }

        .right-wrap {
          width: 100%;
          margin-top: 15px;
        }
      }
    }
  }
</style>
