// 该模块为实现歌手列表页面固定标题功能-滚到那个组就显示那个标题
// 1. 获取每个组的区间高度
// 2. 判断滚动Y值落在那个区间
import { ref, watch, nextTick, computed } from 'vue'

export default function useFixed(props) {
    const TITLE_HEIGHT = 30
    const groupRef = ref(null) // 列表ul的dom
    const listHeights = ref([]) // 高度区间
    const scrollY = ref(0) // 当前滚动的高度
    const currentIndex = ref(0) // 当前滚动的索引
    const distance = ref(0)

    // 计算标题
    const fixedTitle = computed(() => {
        // 如果是0则不用展示title
        if (scrollY.value < 0) {
            return ''
        }
        // 获取当前区间的li
        const currentGroup = props.data[currentIndex.value]
        return currentGroup ? currentGroup.title : ''
    })
    // 计算标题偏移量
    const fixedStyle = computed(() => {
        // distanceValue 表示标题距离区间底部的距离
        const distanceValue = distance.value
        const diff = (distanceValue > 0 && distanceValue < TITLE_HEIGHT) ? distanceValue - TITLE_HEIGHT : 0
        return {
            Transform: `translate3d(0, ${diff}, 0)`
        }
    })

    // 监听数据变化，计算区间高度
    watch(() => props.data, async () => {
        // setTimeout不指定时间表示立即执行，setTimeout即使时立即执行也是推送到队列中，而队列在dom更新之后执行，也能实现下面的需求
        // setTimeout(() => {
        //     calculate()
        // });

        // await nextTick() 表示将calculate函数推迟到dom更新之后执行
        await nextTick()
        calculate()
    })
    // 监听Y值
    watch(scrollY, (newY) => {
        const listHeightValue = listHeights.value
        // listHeightValue.push(0) 所以-1
        for(let i = 0; i < listHeightValue.length - 1; i++) {

            const heightTop = listHeightValue[i]
            const heightBottom = listHeightValue[i+1]
            // 判断最后滚动区间所在的位置，可以用于计算展示的索引标题
            if (newY >= heightTop && newY <= heightBottom) {
                currentIndex.value = i
                distance.value = heightBottom - newY
            }
        }
    })

    // ul列表变化后获取高度区间
    function calculate() {
        // 获取li数组
        const list = groupRef.value.children

        // listHeightValue 用于保存li节点的区间高度 他也是Proxy，所以修改listHeightValue等同于修改listHeights
        const listHeightValue = listHeights.value
        let height = 0

        // 初始化数组
        listHeightValue.length = 0
        listHeightValue.push(height)

        for(let i = 0; i < list.length; i++) {
            height += list[i].clientHeight
            listHeightValue.push(height)
        }
    }
    // scroll组件派发的事件，用于获取Y值
    function onScroll(pos) {
        scrollY.value = -pos.y // better-scroll 实现派发Y值区间为0和负数，负负得正
    }
    return {
        groupRef,
        onScroll,
        fixedTitle,
        fixedStyle,
        currentIndex
    }
}