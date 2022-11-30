import { get } from './base'

export function processSongs(songs) {
    if (!songs.length) {
        return Promise.resolve(songs)
    }
    return get('/api/getSongsUrl', {
        mid: songs.map((song) => {
            return song.mid
        })
    }).then((result) => {
        const map = result.map
        return songs.map((song) => {
            song.url = map[song.mid]
            return song
        }).filter((song) => {
            return song.url && song.url.indexOf('vkey') > -1
        })
    })
}

const lyricMap = {}
export function getLyric(song) {
    // 判断当前播放歌曲列表中是否有歌词，如果有就使用 resolve 返回歌词
    if (song.lyric) {
        return Promise.resolve(song.lyric)
    }
    // 判断缓存中是否有歌词，有就使用 resolve 返回歌词
    const mid = song.mid
    const lyric = lyricMap[mid]
    if (lyric) {
        return Promise.resolve(lyric)
    }
    // 发送网络请求获取歌词
    return get('/api/getLyric', {
        mid
    }).then((result) => {
        const lyric = result ? result.lyric : '[00:00:00]该歌曲暂无法获取歌词'
        lyricMap[mid] = lyric // 做缓存处理
        return lyric
    })
}