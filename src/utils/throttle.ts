type ThrottledFn = (...args: unknown[]) => void

/**
 * 节流：立即执行一次，随后进入 wait 冷却期，冷却期内的调用被忽略
 * @param fn 需要节流的函数
 * @param wait 冷却时长（毫秒），默认 200
 */
export const throttle = (fn: ThrottledFn, wait = 200): ThrottledFn => {
    let timer: number | null = null

    return (...args) => {
        if (timer !== null) return
        timer = window.setTimeout(() => {
            timer = null
        }, wait)
        fn(...args)
    }
}
