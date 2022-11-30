import MusicList from "@/components/music-list/music-list";
import {computed, onMounted, reactive, toRefs} from "@vue/runtime-core";
import {useRouter} from "vue-router";
import storage from "good-storage";
import {processSongs} from "@/service/song";

export default function createDetailComponent(name, key, fetch) {
    return {
        name,
        components: { MusicList },
        props: {
            data: Object
        },
        setup(props) {
            let obj = reactive({
                songs: [],
                title: String,
                pic: String,
                loading: true,
                computedData: null
            })
            const router = useRouter()
            obj.title = computed(()=>{
                const data = obj.computedData
                return data && (data.name || data.title)
            })
            obj.pic = computed(()=>{
                const data = obj.computedData
                return data && data.pic
            })
            obj.computedData = computed(()=>{
                let ret = null
                const data = props.data
                if (data) {
                    ret = data
                } else {
                    const cachedData = storage.session.get(key)
                    if (cachedData && (cachedData.mid || cachedData.id + '') === router.currentRoute.value.params.id) {
                        ret = cachedData
                    }
                }
                return ret
            })
            onMounted(async () => {
                const computedData = obj.computedData
                // 如果当前路由参数不匹配，则退回原来的页面
                if (!computedData) {
                    // router.back()
                    const path = router.currentRoute.value.matched[0].path
                    await router.push({
                        path
                    })
                    return
                }
                const result = await fetch(computedData)
                obj.songs = await processSongs(result?.songs)
                obj.loading = false
            })
            return {
                ...toRefs(obj)
            }
        }
    }
}