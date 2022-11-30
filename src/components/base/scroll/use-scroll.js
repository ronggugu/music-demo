import BScroll from "@better-scroll/core";
import ObserveDOM from "@better-scroll/observe-dom";

import { onMounted, ref, onActivated, onUnmounted, onDeactivated } from "vue";

BScroll.use(ObserveDOM)

export default function useScroll(wrapperRef, options, emit) {
    const scroll = ref(null)
    onMounted(() => {
        // debugger
        const scrollValue = scroll.value = new BScroll(wrapperRef.value, {
            observeDOM: true,
            ...options
        })
        // probeType=0表示不派发scroll事件，12表示派发并且数值越大频率越高，3表示会一直派发
        if (options.probeType > 0) {
            scrollValue.on('scroll', (pos) => {
                emit('scroll', pos)
            })
        }
    })

    onUnmounted(() => {
        scroll.value.destroy()
    })
    // 使用 <keep-alive> 不会触发 onUnmounted
    onActivated(() => {
        scroll.value.enable()
        scroll.value.refresh()
    })
    onDeactivated(() => {
        scroll.value.disable()
    })

    return scroll
}