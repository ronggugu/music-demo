<template>
    <div class="loading">
        <div class="loading-content">
            <img src="./loading.gif" height="24" width="24">
            <p class="desc">{{title}}</p>
        </div>
    </div>
</template>
<script>
import { reactive, ref, toRefs } from '@vue/reactivity'
export default {
    name: 'loading',
    setup() {
        let data = reactive({
            title: '加载中...'
        })
        function setTitle(value){
            data.title = value
        }
        return {
            ...toRefs(data),
            setTitle
        }
    }
}
</script>

<style lang="scss" scoped>
  .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
    .loading-content {
      text-align: center;
      .desc {
        line-height: 20px;
        font-size: $font-size-small;
        color: $color-text-l;
      }
    }
  }
</style>
