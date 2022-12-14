import { ref, watch, onMounted, nextTick, onUnmounted, computed, onActivated, onDeactivated } from 'vue'
import { useStore } from "vuex";
import BScroll from "@better-scroll/core";
import Slide from "@better-scroll/slide";

BScroll.use(Slide)

export default function useMiniSlider() {
    const slider = ref(null)
    const sliderWrapperRef = ref(null)

    const store = useStore()

    const fullScreen = computed(() => store.state.fullScreen)
    const playlist = computed(() => store.state.playlist)
    const sliderShow = computed(() => {
        return !fullScreen.value && !!playlist.value
    })
    const currentIndex = computed(() => store.state.currentIndex)

    onMounted(() => {
        let sliderVal
        watch(sliderShow, async (newSliderShow) => {
            if (newSliderShow) {
                await nextTick()
                if (!sliderVal) {
                    sliderVal = slider.value = new BScroll(sliderWrapperRef.value, {
                        click: true,
                        scrollX: true,
                        scrollY: false,
                        momentum: false,
                        bounce: false,
                        slide: {
                            autoplay: false,
                            loop: true
                        }
                    })
                    // 监听 slidePageChanged 事件
                    sliderVal.on('slidePageChanged', ({ pageX }) => {
                        store.commit('setCurrentIndex', pageX)
                    })
                } else {
                    sliderVal.refresh()
                }
            sliderVal.goToPage(currentIndex.value, 0, 0)
            }
        })
        watch(currentIndex, (newIndex) => {
            if (sliderVal && sliderShow.value) {
                sliderVal.goToPage(newIndex, 0, 0)
            }
        })
        watch(playlist, async (newList) => {
            if (sliderVal && sliderShow.value && newList.length) {
                await nextTick()
                sliderVal.refresh()
            }
        })
    })
    onUnmounted(() => {
        if (slider.value) {
            slider.value.destroy()
        }
    })

    onActivated(() => {
        slider.value.enable()
        slider.value.refresh()
    })

    onDeactivated(() => {
        slider.value.disable()
    })

    return {
        slider,
        sliderWrapperRef
    }
}