import { useStore } from "vuex";
import { computed } from 'vue'
import { PLAY_MODE } from "@/assets/js/constant";

/* 该函数用于实现切换歌曲播放模式 */
export default function useMode() {
    const store = useStore()
    const playMode = computed(() => store.state.playMode)
    const modeIcon = computed(() => {
        const playModeVal = playMode.value
        // 使用一个双层三目运算符来切换歌曲播放模式
        return playModeVal === PLAY_MODE.sequence ? 'icon-sequence' : playModeVal === PLAY_MODE.random ? 'icon-random' : 'icon-loop'
    })

    const modeText = computed(() => {
        const playModeVal = playMode.value
        return playModeVal === PLAY_MODE.sequence ? '顺序播放' : playModeVal === PLAY_MODE.random ? '随机播放' : '单曲循环'

    })

    function changeMode() {
        // mode 的值将在 0, 1, 2 之间
        const mode = (playMode.value + 1) % 3
        // 提交action
        store.dispatch('changeMode', mode)
    }
    return {
        modeIcon,
        changeMode,
        modeText
    }
}