import { useStore } from "vuex";
import { computed, watch, ref } from 'vue'
// CD唱片旋转
export default function useCD() {
    const cdRef = ref(null)
    const cdImageRef = ref(null)

    const store = useStore()
    const playing = computed(() => store.state.playing)

    const cdCls = computed(() => {
        return playing.value ? 'playing' : ''
    })

    watch(playing, (newPlaying) => {
        if (!newPlaying) {
            // 同步cdRef和cdImageRef盒子的transform属性
            syncTransform(cdRef.value, cdImageRef.value)
        }
    })

    function syncTransform(wrapper, inner) {
        const wrapperTransform = getComputedStyle(wrapper).transform
        const innerTransform = getComputedStyle(inner).transform
        // 叠加外层盒子旋转角度
        wrapper.style.transform = wrapperTransform === 'none' ? innerTransform : innerTransform.concat(' ', wrapperTransform)
    }

    return {
        cdCls,
        cdRef,
        cdImageRef
    }
}

