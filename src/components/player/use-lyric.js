import { useStore } from "vuex";
import { computed, watch, ref } from 'vue'
import { getLyric } from "@/service/song";
import Lyric from "lyric-parser/src";

export default function useLyric({ songReady, currentTime }) {
    const currentLyric = ref(null)
    const currentLineNum = ref(0)
    const lyricScrollRef = ref(null)
    const lyricListRef = ref(null)
    const pureMusicLyric = ref('')
    const playingLyric = ref('')

    const store = useStore()
    const currentSong = computed(() => store.getters.currentSong)

    watch(currentSong, async (newSong) => {
        if (!newSong.url || !newSong.id) {
            return
        }

        // 避免在切换歌曲的时候歌词乱跳的情况, 重置属性
        stopLyric()
        currentLyric.value = null
        currentLineNum.value = 0
        playingLyric.value = ''
        pureMusicLyric.value = ''

        const lyric = await getLyric(newSong)
        store.commit('addSongLyric', {
            song: newSong,
            lyric
        })
        // 如果歌曲发生切换动作，当前的lyric和getLyric返回的lyric不同就不做处理
        if (currentSong.value.lyric != lyric) {
            return
        }
        currentLyric.value = new Lyric(lyric, handleLyric)
        const hasLyric = currentLyric.value.lines.length
        if (hasLyric) {
            if (songReady.value) {
                playLyric()
            }
        } else {
            playingLyric.value = pureMusicLyric.value = lyric.replace(/\[(\d{2}):(\d{2}):(\d{2})\]/g, '')
        }
    })

    function handleLyric({ lineNum, txt }) {
        currentLineNum.value = lineNum
        playingLyric.value = txt
        const scrollComp = lyricScrollRef.value
        const listEl = lyricListRef.value
        if (!listEl) {
            return
        }
        if (lineNum > 5) {
            const lineEl = listEl.children[lineNum - 5]
            scrollComp.scroll.scrollToElement(lineEl, 1000)
        } else {
            scrollComp.scroll.scrollToElement(0, 0, 1000)
        }
    }
    function playLyric() {
        const currentLyricVal = currentLyric.value
        if (currentLyricVal) {
            currentLyricVal.seek(currentTime.value * 1000)
        }
    }
    function stopLyric() {
        const currentLyricVal = currentLyric.value
        if (currentLyricVal) {
            currentLyricVal.stop()
        }
    }

    return {
        currentLyric,
        currentLineNum,
        playLyric,
        lyricScrollRef,
        lyricListRef,
        stopLyric,
        pureMusicLyric,
        playingLyric
    }
}