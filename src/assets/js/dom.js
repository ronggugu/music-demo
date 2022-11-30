// 通用dom操作逻辑
export function addClass(el, className) {
    if (!el.classList.contains(className)) {
        el.classList.add(className)
    }
}

export function removeClass(el, className) {
    el.classList.remove(className)
}
