type DebouncedFn = (...args: unknown[]) => void

/**
 * 防抖：停止触发 wait 毫秒后才执行一次；等待期内再次触发会重新计时
 * @param fn 需要防抖的函数
 * @param wait 等待时长（毫秒），默认 200
 */
export const debounce = (fn: DebouncedFn, wait = 200): DebouncedFn => {
    let timer: number | null = null

    return (...args) => {
        if (timer !== null) window.clearTimeout(timer)
        timer = window.setTimeout(() => {
            timer = null
            fn(...args)
        }, wait)
    }
}
