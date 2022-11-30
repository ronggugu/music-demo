export const currentSong = (state)=>{
    /*当 playlist 是一个空数组的时候，state.playlist[state.currentIndex] 的值为undefined
    在 player 组件中执行 currentSong.pic 等渲染图片文字等信息时会报错，如果是一个空对象的话执行 .pic 就不会报错了
    也可以在 player 组件dom中加 <template v-if="currentSong">*/
    return state.playlist[state.currentIndex] || {}
}