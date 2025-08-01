<script setup lang="ts">
import { Role, rolePage } from '@/api/system/role';
import { UpdateUser, updateUser, User } from '@/api/user';
const formData = ref<UpdateUser>({} as UpdateUser);
import { message } from 'ant-design-vue';

import { avatarList } from '@/assets/avatar/icons';

let callback: (data: any) => void;
const visible = ref(false);
const modalTile = ref('');
const roleList = ref<Role[]>([]);
const showModal = ({
  title,
  onSuccess,
  row,
}: {
  row: User;
  title: string;
  onSuccess: () => void;
}) => {
  visible.value = true;
  formData.value = {
    userId: row.userId,
    roleIds: [],
    nickname: row.nickname,
    username: row.username,
    gender: row.gender,
    avatar: row.avatar,
  };
  callback = onSuccess;
  modalTile.value = title;
  getRoleList();
};

const getRoleList = async () => {
  const res = await rolePage({ current: 1, size: 50 });
  roleList.value = res.data.records;
};

const formRef = ref();
const isSubmit = ref(false);
const handleOk = async () => {
  await formRef.value.validateFields();
  isSubmit.value = true;
  await updateUser(formData.value).finally(() => {
    isSubmit.value = false;
  });
  message.success('操作成功');
  callback(formData);
  visible.value = false;
};

const setAvatar = (avatar: string) => {
  formData.value.avatar = avatar;
};

defineExpose({
  showModal,
});
</script>

<template>
  <a-modal
    v-model:open="visible"
    width="400px"
    :ok-button-props="{
      loading: isSubmit,
    }"
    :title="modalTile"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formData" layout="vertical">
      <a-form-item
        label="用户名（可用于账号登录）"
        name="username"
        :rules="[{ required: true, message: '请输入用户名' }]"
      >
        <a-input v-model:value="formData.username" placeholder="请输入用户名"></a-input>
      </a-form-item>
      <a-form-item
        label="昵称"
        name="nickname"
        :rules="[{ required: true, message: '请输入昵称' }]"
      >
        <a-input v-model:value="formData.nickname" placeholder="请输入昵称"></a-input>
      </a-form-item>
      <a-form-item label="性别" name="gender" :rules="[{ required: true, message: '请选择性别' }]">
        <a-select
          v-model:value="formData.gender"
          :options="[
            { value: 0, label: '未知' },
            { value: 1, label: '男' },
            { value: 2, label: '女' },
          ]"
          placeholder="请选择性别"
        ></a-select>
      </a-form-item>
      <a-form-item label="角色" name="roleId">
        <a-select
          :options="roleList"
          :fieldNames="{
            label: 'roleName',
            value: 'roleId',
          }"
          mode="multiple"
          v-model:value="formData.roleIds"
          placeholder="请选择角色"
        ></a-select>
      </a-form-item>
      <a-form-item label="头像" name="avatar" :rules="[{ required: true, message: '请选择头像' }]">
        <a-space :size="[10, 10]" wrap>
          <template v-for="avatar in avatarList" :key="avatar">
            <div
              class="size-50px border-solid border-2px opacity-60 cursor-pointer rounded-5px border-color-transparent"
              :class="
                formData.avatar === avatar.name
                  ? 'border-color-[var(--color-primary)]! opacity-100!'
                  : ''
              "
              @click="setAvatar(avatar.name)"
            >
              <img class="size-46px rounded-3px" :src="avatar.src" alt="" />
            </div>
          </template>
        </a-space>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
