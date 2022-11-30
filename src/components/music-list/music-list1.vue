<template>
  <div class="music-list">
    <div
      class="back"
      @click="goBack"
    >
      <i class="icon-back"></i>
    </div>
    <h1 class="title">{{ title }}</h1>
    <div
      class="bg-image"
      :style="bgImageStyle"
      ref="bgImage"
    >
      <div
        class="filter"
        :style="filterStyle"
      ></div>
    </div>
    <scroll
      class="list"
      :style="scrollStyle"
      v-loading="loading"
      v-no-result:[noResultText]="noResult"
      :probe-type="3"
      @scroll="onScroll"
    >
      <div class="song-list-wrapper">
        <song-list
          :songs="songs"
        ></song-list>
      </div>
    </scroll>
  </div>
</template>
<script>
import { computed, onMounted, reactive, toRefs, ref } from '@vue/runtime-core'
import SongList from '@/components/base/song-list/song-list'
import Scroll from '@/components/base/scroll/scroll'
import { useRouter } from 'vue-router'
// import { mapActions } from 'vuex'
import { selectPlay } from '@/store/actions'

const RESERVED_HEIGHT = 40

export default {
    name: 'music-list',
    components: { SongList, Scroll },
    props: {
        songs: {
            type: Array,
            default() {
                return []
            }
        },
        title: String,
        pic: String,
        loading: Boolean,
        noResultText: {
            type: String,
            default: '没有找到可播放的歌曲'
        }
    },
    setup(props) {
        let data = reactive({
            bgImageStyle: null,
            scrollStyle: null,
            imageHeight: 0,
            scrollY: 0,
            maxTranslateY: 0,
            filterStyle: null
        })
        const bgImage = ref(null)
        const router = useRouter()

        data.bgImageStyle =computed(() => {
            const scrollY = data.scrollY
            let zIndex = 0
            let paddingTop = '70%'
            let height = 0
            // translateZ 解决iOS端滚动时背景图片被遮挡的问题
            let translateZ = 0
            // 滚动到页面标题时使得页面标题层级在最上面，图片在第二，歌曲列表在最下面的效果
            if(scrollY > data.maxTranslateY) {
                zIndex = 10
                paddingTop = 0
                height = `${RESERVED_HEIGHT}px`
                translateZ = 1
            }
            // 实现下拉歌手背景图片放大的效果
            let scale = 1
            if(scrollY < 0) { // 小于0就表示向下拉
                scale = 1 + Math.abs(scrollY / data.imageHeight)
            }
            return { 
                zIndex,
                paddingTop,
                height,
                backgroundImage: `url(${props.pic})`,
                transform: `scale(${scale})translateZ(${translateZ}px)`
             }
        })
        data.scrollStyle =computed(() => {
            return { top: `${data.imageHeight}px` }
        })
        data.filterStyle = computed(()=>{
            // 当向上拉列表的时候歌手背景图片高斯模糊
            let blur = 0
            const scrollY = data.scrollY
            const imageHeight = data.imageHeight
            if (scrollY >= 0) { // 指向上拉
                blur = Math.min(data.maxTranslateY / imageHeight, scrollY / imageHeight) * 10
            }
            return {
                backdropFilter: `blur(${blur}px)`
            }
        })
        data.noResult = computed(()=>{
            return !props.loading && !props.songs.length
        })
        onMounted(()=>{
            data.imageHeight = bgImage.value.clientHeight
            // 最大滚动值
            data.maxTranslateY = data.imageHeight - RESERVED_HEIGHT
        })
        function goBack() {
            router.back()
        }
        function onScroll(pos) {
            data.scrollY = -pos.y
        }
        function selectItem({ song, index }) {

        }
        return {
            ...toRefs(data),
            bgImage,
            goBack,
            onScroll
        }
    }
}


</script>
<style lang="scss" scoped>
  .music-list {
    position: relative;
    height: 100%;
    .back {
      position: absolute;
      top: 0;
      left: 6px;
      z-index: 20;
      transform: translateZ(2px);
      .icon-back {
        display: block;
        padding: 10px;
        font-size: $font-size-large-x;
        color: $color-theme;
      }
    }
    .title {
      position: absolute;
      top: 0;
      left: 10%;
      width: 80%;
      z-index: 20;
      transform: translateZ(2px);
      @include no-wrap();
      text-align: center;
      line-height: 40px;
      font-size: $font-size-large;
      color: $color-text;
    }
    .bg-image {
      position: relative;
      width: 100%;
      transform-origin: top;
      background-size: cover;
    //   padding-top: 70%;
    //   height: 0;
      .play-btn-wrapper {
        position: absolute;
        bottom: 20px;
        z-index: 10;
        width: 100%;
        .play-btn {
          box-sizing: border-box;
          width: 135px;
          padding: 7px 0;
          margin: 0 auto;
          text-align: center;
          border: 1px solid $color-theme;
          color: $color-theme;
          border-radius: 100px;
          font-size: 0;
        }
        .icon-play {
          display: inline-block;
          vertical-align: middle;
          margin-right: 6px;
          font-size: $font-size-medium-x;
        }
        .text {
          display: inline-block;
          vertical-align: middle;
          font-size: $font-size-small;
        }
      }
      .filter {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(7, 17, 27, 0.4);
      }
    }
    .list {
      position: absolute;
      bottom: 0;
      width: 100%;
      z-index: 0;
    //   overflow: hidden;
      .song-list-wrapper {
        padding: 20px 30px;
        background: $color-background;
      }
    }
  }
</style>