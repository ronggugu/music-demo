import storage from 'good-storage'

function inertArray(arr, val, compare, maxLen) {
    const index = arr.findIndex(compare)
    if (index === 0) {
        return
    }
    if (index > 0) {
        arr.splice(index, 1)
    }
    arr.unshift(val)
    // 设置最大的存储歌曲数量，如果超过传入值就将第一首歌pop出数组，先进先出
    if (maxLen && arr.length > maxLen) {
        arr.pop()
    }
}
function deleteFromArray(arr, compare) {
    const index = arr.findIndex(compare)
    if (index > -1) {
        arr.splice(index, 1)
    }
}

export function save(item, key, compare, maxLen) {
    const items = storage.get(key, [])
    inertArray(items, item, compare, maxLen)
    storage.set(key, items)
    return items
}

export function remove(key, compare) {
    const items = storage.get(key, [])
    deleteFromArray(items, compare)
    storage.set(key, items)
    return items
}

export function load(key) {
    return storage.get(key, [])
}
export function clear(key) {
    storage.remove(key)
    return []
}
export function saveAll(items, key) {
    storage.set(key, items)
}