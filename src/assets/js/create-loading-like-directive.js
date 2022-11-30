// 自定义指令 实现loading、no-result等

import { createApp } from "@vue/runtime-dom"

import { addClass, removeClass } from '@/assets/js/dom'

const relativeStyle = 'g-relative'

export default function createLoadingLikeDirective(comp) {
    return {
        // 指令挂载后触发 如果loadin g==true 则将loading组件插入到el下
        mounted(el, binding) {
            const app = createApp(comp)
            // 动态创建一个div
            const instance = app.mount(document.createElement('div'))
            const name = comp.name
            if (!el[name]) {
                el[name] = {}
            }
            el[name].instance = instance
            // 动态参数
            const title = binding.arg
            if (typeof title != 'undefined') {
                instance.setTitle(title)
            }
            if(binding.value) {
                appendInstance(el)
            }
        },
        // 指令更新后，loading==false/true
        updated(el, binding) {
            const title = binding.arg
            const name = comp.name
            if (typeof title != 'undefined') {
                el[name].instance.setTitle(title)
            }
            if(binding.value !== binding.oldValue) {
                binding.value ? appendInstance(el) : removeInstance(el)
            }
        }
    }

    function appendInstance(el) {
        const name = comp.name
        const style = getComputedStyle(el)
        // 判断当前dom(el) 是否是 'absolute', 'flxed', 'relative' 如果不是就添加 这样做可以让loading兼容性更好
        if(['absolute', 'fixed', 'relative'].indexOf(style.position) === -1) {
            addClass(el, relativeStyle)
        }
        // 将el.instance挂载到loading作用的dom下
        el.appendChild(el[name].instance.$el)
    }

    function removeInstance(el) {
        const name = comp.name
        removeClass(el, relativeStyle)
        el.removeChild(el[name].instance.$el)
    }
}