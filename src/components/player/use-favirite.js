import { useStore } from "vuex";
import { computed } from 'vue'
import { save, remove } from "@/assets/js/array-store";
import { FAVORITE_KEY } from "@/assets/js/constant";

// 收藏歌曲
export default function useFavorite() {
    const store = useStore()
    const favoriteList = computed(() => store.state.favoriteList)
    const maxLen = 100

    function getFavoriteIcon(song) {
        return isFavorite(song) ? 'icon-favorite' : 'icon-not-favorite'
    }
    // 将歌曲添加到或从收藏歌曲列表中移除
    function toggleFavorite(song) {
        let list
        if (isFavorite(song)) {
            // remove
            list = remove(FAVORITE_KEY, compare)
        } else {
            // save
            list = save(song, FAVORITE_KEY, compare, maxLen)
        }
        store.commit('setFavoriteList', list)
        function compare(item) {
            return item.id === song.id
        }
    }

    function isFavorite(song) {
        // 判断当前播放歌曲是否在收藏列表中
        return favoriteList.value.findIndex((item) => {
            return item.id === song.id
        }) > -1
    }

    return {
        getFavoriteIcon,
        toggleFavorite
    }
}
