import { computed, ref } from "@vue/reactivity";

export default function useShortcut(props, groupRef) {
    const ANCHOR_HEIGHT = 18
    const scrollRef = ref(null)
    const touch = {}

    const shortcutList = computed(() => {
        return props.data.map((group) => {
            return group.title
        })
    })
    // 点按
    function onShortcutTouchStart(e) {
        const anchorIndex = parseInt(e.target.dataset.index)
        touch.y1 = e.touches[0].pageY 
        touch.anchorIndex = anchorIndex

        scrollTo(anchorIndex)
    }
    // 移动
    function onShortcutTouchMove(e) {
        touch.y2 = e.touches[0].pageY
         // | 0 表示向下取整， 它先将数值转换成32位二进制整数值（如果有小数则忽略)，再对二进制上每一位进行或运算，得出结果
         // 其中0的二进制就是32个0，无论任何数对进行或（|）运算都是原来的数，使用 Math.floor 也可以实现相同的功能
        const delta = (touch.y2 - touch.y1) / ANCHOR_HEIGHT | 0
        const anchorIndex = touch.anchorIndex + delta

        scrollTo(anchorIndex)
    }

    // 列表滚动到某个位置 根据index
    function scrollTo(index) {
        // 检验index的合法性
        if (isNaN(index)) {
            return
        }
        // index 要在shortcutList区域内
        index = Math.max(0, Math.min(shortcutList.value.length - 1, index))
        
        const targetEL = groupRef.value.children[index]
        const scroll = scrollRef.value.scroll
        scroll.scrollToElement(targetEL, 0)
    }

    return {
        shortcutList,
        onShortcutTouchStart,
        scrollRef,
        onShortcutTouchMove
    }
}