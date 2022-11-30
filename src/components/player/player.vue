<template>
    <div
        class="player"
        v-show="playlist.length"
    >
        <transition
            name="normal"
            @enter="enter"
            @after-enter="afterEnter"
            @leave="leave"
            @after-leave="afterLeave"
        >
            <div
                class="normal-player"
                v-show="fullScreen"
            >
                <div class="background">
                    <img :src="currentSong.pic">
                </div>
                <div class="top">
                    <div
                        class="back"
                        @click="goBack"
                    >
                        <i class="icon-back"></i>
                    </div>
                    <h1 class="title">{{currentSong.name}}</h1>
                    <h2 class="subtitle">{{currentSong.singer}}</h2>
                </div>
                <div class="middle"
                    @touchstart.prevent="onMiddleTouchStart"
                    @touchmove.prevent="onMiddleTouchMove"
                    @touchend.prevent="onMiddleTouchEnd"
                >
                    <div class="middle-l" :style="middleLStyle">
                        <div ref="cdWrapperRef" class="cd-wrapper">
                            <div ref="cdRef" class="cd">
                                <img ref="cdImageRef" class="image" :class="cdCls" :src="currentSong.pic">
                            </div>
                        </div>
                        <div class="playing-lyric-wrapper">
                            <div class="playing-lyric">
                                {{ playingLyric }}
                            </div>
                        </div>
                    </div>
                    <scroll class="middle-r" ref="lyricScrollRef" :style="middleRStyle">
                        <div class="lyric-wrapper">
                            <div ref="lyricListRef" v-if="currentLyric">
                                <p
                                    class="text"
                                    :class="{'current': currentLineNum ===index}"
                                    v-for="(line,index) in currentLyric.lines"
                                    :key="line.num"
                                >
                                    {{line.txt}}
                                </p>
                            </div>
                            <div class="pure-music" v-show="pureMusicLyric">
                                <p>
                                    {{ pureMusicLyric }}
                                </p>
                            </div>
                        </div>
                    </scroll>
                </div>
                <div class="bottom">
                    <div class="dot-wrapper">
                        <span class="dot" :class="{'active':currentShow==='cd'}"></span>
                        <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
                    </div>
                    <div class="progress-wrapper">
                        <span class="time time-l">{{formatTime(currentTime)}}</span>
                        <div class="progress-bar-wrapper">
                            <progress-bar
                                ref="barRef"
                                :progress="progress"
                                @progress-changing="onProgressChanging"
                                @progress-changed="onProgressChanged"
                            ></progress-bar>
                        </div>
                        <span class="time time-r">{{formatTime(currentSong.duration)}}</span>
                    </div>
                    <div class="operators">
                        <div class="icon i-left">
                            <i @click="changeMode" :class="modeIcon"></i>
                        </div>
                        <div class="icon i-left" :class="disableCls">
                            <i @click="prev" class="icon-prev"></i>
                        </div>
                        <div class="icon i-center" :class="disableCls">
                            <i @click="togglePlay" :class="playIcon"></i>
                        </div>
                        <div class="icon i-right" :class="disableCls">
                            <i  @click="next" class="icon-next"></i>
                        </div>
                        <div class="icon i-right">
                            <i @click="toggleFavorite(currentSong)" :class="getFavoriteIcon(currentSong)"></i>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <mini-player :progress="progress" :toggle-play="togglePlay"></mini-player>
        <audio ref="audioRef"
               @pause="pause"
               @canplay="ready"
               @error="error"
               @timeupdate="updateTime"
               @ended="end"
        ></audio>
    </div>
</template>

<script>
import { useStore } from "vuex"
import { computed, watch, ref, nextTick } from 'vue'
import useMode from '@/components/player/use-mode'
import useFavorite from '@/components/player/use-favirite'
import ProgressBar from '@/components/player/progress-bar'
import { formatTime } from "@/assets/js/util";
import { PLAY_MODE } from "@/assets/js/constant";
import useCD from "@/components/player/use-cd";
import useLyric from "@/components/player/use-lyric";
import scroll from "@/components/base/scroll/scroll";
import useMiddleInteractive from "@/components/player/use-middle-interactive";
import MiniPlayer from "@/components/player/mini-player";
import useAnimation from "@/components/player/use-animation";
import usePlayHistory from "@/components/player/use-play-history";

export default {
    name: "player",
    components: {
        MiniPlayer,
        ProgressBar,
        scroll
    },
    setup() {
        const store = useStore()
        const audioRef = ref(null)
        const songReady = ref(false)
        const barRef = ref(null)
        const { modeIcon, changeMode } = useMode()
        const { getFavoriteIcon, toggleFavorite } = useFavorite()
        const currentTime = ref(0)
        let progressChanging = false
        const playMode = computed(() => store.state.playMode)
        const { cdCls, cdImageRef, cdRef } = useCD()
        const { currentLyric, currentLineNum, playLyric, playingLyric,
            lyricScrollRef, lyricListRef, stopLyric, pureMusicLyric } =
            useLyric({ songReady, currentTime })
        const {
            currentShow,
            middleRStyle,
            middleLStyle,
            onMiddleTouchEnd,
            onMiddleTouchMove,
            onMiddleTouchStart} = useMiddleInteractive()
        const { cdWrapperRef, afterEnter, enter, leave, afterLeave } = useAnimation()
        const { savePlay } = usePlayHistory()

        // 在 actions 中的 selectPlay， fullScreen被初始化为 true
        const fullScreen = computed(() => store.state.fullScreen)
        const currentSong = computed(() => store.getters.currentSong)
        const playing = computed(() => store.state.playing)
        const playIcon = computed(() => {
            return playing.value ? 'icon-pause' : 'icon-play'
        })
        const currentIndex = computed(() => store.state.currentIndex)
        const playlist = computed(() => store.state.playlist)
        const disableCls = computed(() => {
            return songReady.value ? '' : 'disable'
        })
        const progress = computed(() => {
            return currentTime.value / currentSong.value.duration
        })

        // 监听当前播放歌曲，如果歌曲id和地址都存在就调用 audioRef 实例的播放方法
        watch(currentSong, (newSong) => {
            if (!newSong.id || !newSong.url) {
                return
            }
            currentTime.value = 0 // 重置当前播放时间
            songReady.value = false
            const audioEl = audioRef.value
            audioEl.src = newSong.url
            audioEl.play()
            store.commit('setPlayingState', true)
        })
        // 监听播放图标状态决定歌曲是否播放
        watch(playing, (newPlaying) => {
            if (!songReady.value) { // 数据缓冲好再播放， 解决 DOMException: The play() request was interrupted by a new load request
                return
            }
            const audioEl = audioRef.value
            // 同步歌词
            if (newPlaying) {
                audioEl.play()
                playLyric()
            } else {
                audioEl.pause()
                stopLyric()
            }
            // newPlaying ? audioEl.play() : audioEl.pause()
        })
        watch(fullScreen, async (newFullScreen) => {
            if (newFullScreen) {
                await nextTick()
                barRef.value.setOffset(progress.value)
            }
        })

        function goBack() {
            // 离开播放页
            store.commit('setFullScreen', false)
        }
        function togglePlay() {
            if (!songReady.value) {
                return
            }
            store.commit('setPlayingState', !playing.value)
        }
        // 监听audio标签的原生事件，当播放关闭的时候修改store的状态为false
        // 这是为了解决非用户触发的情况下歌曲被暂停导致实际播放的状态和store状态不一致的情况，比如笔记本合上，电脑睡眠导致的歌曲暂停播放
        function pause() {
            store.commit('setPlayingState', false)
        }
        // 歌曲循环播放
        function loop() {
            const audioEl = audioRef.value
            audioEl.currentTime = 0
            audioEl.play()
            store.commit('setPlayingState', true)
        }
        // 后退按钮
        function prev() {
            const list = playlist.value
            if (!songReady.value || !list.length) {
                return
            }
            if (list.length === 1) { // 如果只有一首歌
                loop()
            } else {
                let index = currentIndex.value - 1
                if (index === -1) {
                    index = list.length - 1
                }
                store.commit('setCurrentIndex', index)
            }
        }
        // 下一首
        function next() {
            const list = playlist.value
            if (!songReady.value || !list.length) {
                return
            }
            if (list.length === 1) { // 如果只有一首歌
                loop()
            } else {
                let index = currentIndex.value + 1
                if (index === list.length) {
                    index = 0
                }
                store.commit('setCurrentIndex', index)
            }
        }
        // 音频数据缓冲
        function ready() {
            if (songReady.value) {
                return
            }
            songReady.value = true
            playLyric() // 歌词同步
            savePlay(currentSong.value) // 保存当前播放的歌曲
        }
        // 如果歌曲播放出错 ready状态也应该为true，否则将不能点击前进和后退
        function error() {
            songReady.value = true
        }
        // 实时更新播放进度
        function updateTime(e) {
            // 在 onProgressChanging 的时候不应该再修改当前播放时间的值
            if (!progressChanging) {
                currentTime.value = e.target.currentTime
            }
        }
        function onProgressChanging(progress) {
            progressChanging = true
            currentTime.value = currentSong.value.duration * progress
            // 同步歌词
            playLyric()
            stopLyric()
        }
        function onProgressChanged(progress) {
            progressChanging = false
            audioRef.value.currentTime = currentTime.value = currentSong.value.duration * progress
            if (!playing.value) {
                store.commit('setPlayingState', true)
            }
            // 同步歌词
            playLyric()
        }
        function end() {
            currentTime.value = 0
            // 再歌曲播放完毕的时候根据当前歌曲播放模式跳转到下一首歌
            if (playMode.value === PLAY_MODE.loop) {
                loop()
            } else {
                next()
            }
        }

        return {
            fullScreen,
            currentSong,
            audioRef,
            barRef,
            playIcon,
            currentTime,
            disableCls,
            progress,
            playlist,
            updateTime,
            goBack,
            togglePlay,
            pause,
            prev,
            next,
            ready,
            error,
            formatTime,
            onProgressChanging,
            onProgressChanged,
            end,
            // mode
            modeIcon,
            changeMode,
            // favorite
            getFavoriteIcon,
            toggleFavorite,
            // cd
            cdCls,
            cdImageRef,
            cdRef,
            // lyric
            currentLyric,
            currentLineNum,
            lyricScrollRef,
            lyricListRef,
            pureMusicLyric,
            playingLyric,
            // middle-interaction
            currentShow,
            middleRStyle,
            middleLStyle,
            onMiddleTouchEnd,
            onMiddleTouchMove,
            onMiddleTouchStart,
            // animation
            afterEnter,
            enter,
            cdWrapperRef,
            leave,
            afterLeave
        }
    }
}
</script>

<style lang="scss" scoped>
.player {
    .normal-player {
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: 150;
        background: $color-background;
        .background {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            opacity: 0.6;
            filter: blur(20px);

            img {
                width: 100%;
                height: 100%;
            }
        }
        .top {
            position: relative;
            margin-bottom: 25px;
            .back {
                position: absolute;
                top: 0;
                left: 6px;
                z-index: 50;
            }
            .icon-back {
                display: block;
                padding: 9px;
                font-size: $font-size-large-x;
                color: $color-theme;
                transform: rotate(-90deg);
            }
            .title {
                width: 70%;
                margin: 0 auto;
                line-height: 40px;
                text-align: center;
                @include no-wrap();
                font-size: $font-size-large;
                color: $color-text;
            }
            .subtitle {
                line-height: 20px;
                text-align: center;
                font-size: $font-size-medium;
                color: $color-text;
            }
        }
        .middle {
            position: fixed;
            width: 100%;
            top: 80px;
            bottom: 170px;
            white-space: nowrap;
            font-size: 0;
            .middle-l {
                display: inline-block;
                vertical-align: top;
                position: relative;
                width: 100%;
                height: 0;
                padding-top: 80%;
                .cd-wrapper {
                    position: absolute;
                    left: 10%;
                    top: 0;
                    width: 80%;
                    box-sizing: border-box;
                    height: 100%;
                    .cd {
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                        img {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            box-sizing: border-box;
                            border-radius: 50%;
                            border: 10px solid rgba(255, 255, 255, 0.1);
                        }
                        /*CD旋转效果*/
                        .playing {
                            animation: rotate 20s linear infinite
                        }
                    }
                }
                .playing-lyric-wrapper {
                    width: 80%;
                    margin: 30px auto 0 auto;
                    overflow: hidden;
                    text-align: center;
                    .playing-lyric {
                        height: 20px;
                        line-height: 20px;
                        font-size: $font-size-medium;
                        color: $color-text-l;
                    }
                }
            }
            .middle-r {
                display: inline-block;
                vertical-align: top;
                width: 100%;
                height: 100%;
                overflow: hidden;
                .lyric-wrapper {
                    width: 80%;
                    margin: 0 auto;
                    overflow: hidden;
                    text-align: center;
                    .text {
                        line-height: 32px;
                        color: $color-text-l;
                        font-size: $font-size-medium;
                        &.current {
                            color: $color-text;
                        }
                    }
                    .pure-music {
                        padding-top: 50%;
                        line-height: 32px;
                        color: $color-text-l;
                        font-size: $font-size-medium;
                    }
                }
            }
        }
        .bottom {
            position: absolute;
            bottom: 50px;
            width: 100%;
            .dot-wrapper {
                text-align: center;
                font-size: 0;
                .dot {
                    display: inline-block;
                    vertical-align: middle;
                    margin: 0 4px;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: $color-text-l;
                    &.active {
                        width: 20px;
                        border-radius: 5px;
                        background: $color-text-ll;
                    }
                }
            }
            .progress-wrapper {
                display: flex;
                align-items: center;
                width: 80%;
                margin: 0px auto;
                padding: 10px 0;
                .time {
                    color: $color-text;
                    font-size: $font-size-small;
                    flex: 0 0 40px;
                    line-height: 30px;
                    width: 40px;
                    &.time-l {
                        text-align: left;
                    }
                    &.time-r {
                        text-align: right;
                    }
                }
                .progress-bar-wrapper {
                    flex: 1;
                }
            }
            .operators {
                display: flex;
                align-items: center;
                .icon {
                    flex: 1;
                    color: $color-theme;
                    &.disable {
                        color: $color-theme-d;
                    }
                    i {
                        font-size: 30px;
                    }
                }
                .i-left {
                    text-align: right;
                }
                .i-center {
                    padding: 0 20px;
                    text-align: center;
                    i {
                        font-size: 40px;
                    }
                }
                .i-right {
                    text-align: left
                }
                .icon-favorite {
                    color: $color-sub-theme;
                }
            }
        }
        &.normal-enter-active, &.normal-leave-active {
            transition: all .6s;
            .top, .bottom {
                transition: all .6s cubic-bezier(0.45, 0, 0.55, 1);
            }
        }
        &.normal-enter-from, &.normal-leave-to {
            opacity: 0;
            .top {
                transform: translate3d(0, -100px, 0);
            }
            .bottom {
                transform: translate3d(0, 100px, 0)
            }
        }
    }
}
</style>