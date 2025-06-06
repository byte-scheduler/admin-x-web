import { isArray, isEqual, isFunction, isNull, isUndefined } from 'lodash-es';

import { DisplayMode } from '@/components/Schema/enums';
import { FormItemProps } from '@/components/Schema/types';

function useFormOptions(props: FormItemProps, formItemValue: any) {
  const { valueKey, labelKey } = props;
  const options = ref([]);

  const isView = computed(() => {
    if (isFunction(props.mode)) {
      return props.mode({ ...props, value: formItemValue.value }) === DisplayMode.VIEW;
    }
    return isUndefined(props.mode) ? false : props.mode === DisplayMode.VIEW;
  });

  const viewValue = computed(() => {
    if (isFunction(props.format)) {
      return props.format({ ...props, value: formItemValue.value });
    }
    let viewVal = formItemValue.value;
    if (options.value.length && valueKey && labelKey) {
      if (isArray(viewVal)) {
        return options.value
          .filter((n) => viewVal.includes(n[valueKey]))
          .map((n) => n[labelKey])
          .join('、');
      }
      const findValue = options.value.find((item: Record<string, any>) =>
        isEqual(item[valueKey], formItemValue.value),
      );
      const val = findValue?.[labelKey];
      if (!(isNull(val) || isUndefined(val))) {
        viewVal = val;
      }
    }
    return viewVal || props.emptyText;
  });

  const viewSlot = computed(() => {
    return props.viewSlot;
  });

  /**
   * 选项组件相关，加载选项数据
   */
  const isLoading = ref(false);

  async function loadOptions(params?: Record<string, any>) {
    isLoading.value = true;
    let res = [];
    if (isFunction(props.options)) {
      res = props.options({ ...props, params });
    } else if (props.options) {
      res = props.options;
    } else if (isFunction(props.remoteOptions)) {
      res = await props.remoteOptions({ ...props, params });
    }
    options.value = res;
    isLoading.value = false;
    return res;
  }

  return {
    isView,
    viewSlot,
    viewValue,
    options,
    isLoading,
    loadOptions,
  };
}

export { useFormOptions };
