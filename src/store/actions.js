import { PLAY_MODE } from "@/assets/js/constant";
import { shuffle } from "@/assets/js/util";

export function selectPlay({ commit }, { list, index }) {
    commit('setPlayMode', PLAY_MODE.sequence)
    commit('setSequenceList', list)
    commit('setPlayingState', true)
    commit('setFullScreen', true)
    commit('setPlaylist', list)
    commit('setCurrentIndex', index)
}

export function randomPlay({ commit }, list) {
    commit('setPlayMode', PLAY_MODE.random)
    commit('setSequenceList', list)
    commit('setPlayingState', true)
    commit('setFullScreen', true)
    commit('setPlaylist', shuffle(list))
    commit('setCurrentIndex', 0)
}

export function changeMode({ commit, state, getters}, mode) {
    // 获取当前播放歌曲的id
    const currentId = getters.currentSong.id

    if (mode === PLAY_MODE.random) {
        commit('setPlaylist', shuffle(state.sequenceList))
    } else {
        commit('setPlaylist', state.sequenceList)
    }

    // 在更改后的歌曲播放列表中寻找未更改前歌曲所在的位置
    const index = state.playlist.findIndex((song) => {
        return song.id === currentId
    })
    // 设置前面正在播放的歌曲为当前列表中播放的歌曲，以实现在切换歌曲播放模式的时候，当前播放歌曲不受影响
    commit('setCurrentIndex', index)
    commit('setPlayMode', mode)
}

export function removeSong({ commit, state }, song) {
    // 不能直接修改state中的数据，必须要通过mutation，因此通过slice获取其副本，然后再通过commit提交mutation的方式来修改
    const sequenceList = state.sequenceList.slice()
    const playlist = state.playlist.slice()

    const sequenceIndex = findIndex(sequenceList, song)
    const playIndex = findIndex(playlist, song)

    if (sequenceIndex < 0 || playIndex < 0) {
        return
    }

    let currentIndex = state.currentIndex
    if (playIndex < currentIndex || currentIndex === playlist.length) {
        currentIndex--
    }

    sequenceList.splice(sequenceIndex, 1)
    playlist.splice(playIndex, 1)

    commit('setSequenceList', sequenceList)
    commit('setPlaylist', playlist)
    commit('setCurrentIndex', currentIndex)
    if (!playlist.length) {
        commit('setPlayingState', false)
    }
}

function findIndex(list, song) {
    return list.findIndex((item) => {
        return item.id === song.id
    })
}

export function clearSongList({ commit }) {
    commit('setSequenceList', [])
    commit('setPlaylist', [])
    commit('setCurrentIndex', 0)
    commit('setPlayingState', false)
}

export function addSong({ commit, state }, song) {
    const playlist = state.playlist.slice()
    const sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex
    const playIndex = findIndex(playlist, song)

    if (playIndex > -1) {
        currentIndex = playIndex
    } else {
        playlist.push(song)
        currentIndex = playlist.length - 1
    }

    const sequenceIndex = findIndex(sequenceList, song)
    if (sequenceIndex === -1){
        sequenceList.push(song)
    }

    commit('setSequenceList', sequenceList)
    commit('setPlaylist', playlist)
    commit('setCurrentIndex', currentIndex)
    commit('setPlayingState', true)
    commit('setFullScreen', true)
}