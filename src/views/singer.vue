<template>
    <div class="singer" v-loading="!singers.length">
        <index-list :data="singers" @select="selectSinger">
        </index-list>
        <router-view v-slot="{ Component }">
            <transition appear name="slide">
                <component :is="Component" :data="selectdSinger" />
            </transition>
        </router-view>
    </div>
</template>
<script>
import { getSingerList } from '@/service/singer'
import IndexList from '@/components/index-list/index-list'
import { onMounted, reactive, toRefs } from '@vue/runtime-core'
import { useRouter } from 'vue-router'
import storage from 'good-storage'
import { SINGER_KEY } from '@/assets/js/constant'

export default {
    name: 'singer',
    components: {
        IndexList
    },
    setup() {
        let data = reactive({
            singers: [],
            selectdSinger: null
        })
        onMounted(async () => {
            const result = await getSingerList()
            data.singers = result.singers
        })
        const router = useRouter()
        function selectSinger(singer) {
            data.selectdSinger = singer
            // 缓存 singer
            cacheSinger(singer)
            router.push({
                path: `/singer/${singer.mid}`
            })
        }
        function cacheSinger(singer) {
          storage.session.set(SINGER_KEY, singer)
        }
        return {
            ...toRefs(data),
            selectSinger
        }
    },

    // option api 实现
    // data() {
    //     return {
    //         singers: [],
    //         selectdSinger: null
    //     }
    // },
    // async created() {
    //     const result = await getSingerList()
    //     this.singers = result.singers
    // },
    // methods: {
    //     selectSinger(singer) {
    //         this.selectdSinger = singer
    //         this.$router.push({
    //             path: `/singer/${singer.mid}`
    //         })
    //     }
    // }
}
</script>
<style lang="scss" scoped>
  .singer {
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;
  }
</style>
