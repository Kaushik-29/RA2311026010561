/**
 * Min-heap for top-N selection by composite priority.
 * Root holds the *worst* item among the current best-N (minimum goodness).
 * Insert/replace: O(log k), k = heap capacity → O(n log k) over n items.
 */

const TYPE_RANK = {
  placement: 3,
  result: 2,
  event: 1,
}

function normalizeType(type) {
  if (type == null || type === '') return ''
  return String(type).trim().toLowerCase()
}

export function typeRank(type) {
  const key = normalizeType(type)
  return TYPE_RANK[key] ?? 0
}

function parseTimeMs(ts) {
  if (ts == null) return 0
  if (typeof ts === 'number' && !Number.isNaN(ts)) return ts
  const d = new Date(ts)
  const ms = d.getTime()
  return Number.isNaN(ms) ? 0 : ms
}

/**
 * Same field resolution as the UI so ranking matches what we display.
 * @param {object | null | undefined} item
 */
export function getNotificationType(item) {
  if (!item || typeof item !== 'object') return ''
  const v =
    item.type ??
    item.Type ??
    item.notificationType ??
    item.NotificationType ??
    item.category
  if (v == null || v === '') return ''
  return String(v).trim()
}

/** Timestamp fields often vary by API contract */
export function getNotificationTimeMs(item) {
  if (!item || typeof item !== 'object') return 0
  const ts =
    item.timestamp ??
    item.Timestamp ??
    item.createdAt ??
    item.time ??
    item.date
  return parseTimeMs(ts)
}

/** Lower value = worse (evicted first). Used as min-heap key = "goodness" ordering. */
export function goodness(item) {
  const tr = typeRank(getNotificationType(item))
  const t = getNotificationTimeMs(item)
  return { tr, t }
}

/**
 * @returns {number} negative if a is worse than b, positive if b is worse, 0 if tie
 */
export function compareGoodness(a, b) {
  const ga = goodness(a)
  const gb = goodness(b)
  if (ga.tr !== gb.tr) return ga.tr - gb.tr
  return ga.t - gb.t
}

/**
 * Full list sorted best-first (same ordering rules as heap output).
 * O(n log n) — used only for the "all notifications" view.
 */
export function sortAllByPriority(notifications) {
  if (!Array.isArray(notifications) || notifications.length === 0) return []
  return [...notifications].sort((a, b) => -compareGoodness(a, b))
}

class MinHeap {
  constructor(compareFn) {
    this.arr = []
    this.compare = compareFn
  }

  size() {
    return this.arr.length
  }

  peek() {
    return this.arr[0]
  }

  push(x) {
    this.arr.push(x)
    this._siftUp(this.arr.length - 1)
  }

  pop() {
    const a = this.arr
    if (a.length === 0) return undefined
    const top = a[0]
    const last = a.pop()
    if (a.length > 0 && last !== undefined) {
      a[0] = last
      this._siftDown(0)
    }
    return top
  }

  _parent(i) {
    return Math.floor((i - 1) / 2)
  }

  _left(i) {
    return 2 * i + 1
  }

  _right(i) {
    return 2 * i + 2
  }

  _siftUp(i) {
    const a = this.arr
    const cmp = this.compare
    while (i > 0) {
      const p = this._parent(i)
      if (cmp(a[i], a[p]) >= 0) break
      ;[a[i], a[p]] = [a[p], a[i]]
      i = p
    }
  }

  _siftDown(i) {
    const a = this.arr
    const cmp = this.compare
    const n = a.length
    for (;;) {
      let smallest = i
      const l = this._left(i)
      const r = this._right(i)
      if (l < n && cmp(a[l], a[smallest]) < 0) smallest = l
      if (r < n && cmp(a[r], a[smallest]) < 0) smallest = r
      if (smallest === i) break
      ;[a[i], a[smallest]] = [a[smallest], a[i]]
      i = smallest
    }
  }

  /** All elements, best-first (not heap order). */
  toSortedBestFirst() {
    return [...this.arr].sort((x, y) => -compareGoodness(x, y))
  }
}

/**
 * @param {object[]} notifications
 * @param {number} n  heap capacity (top N)
 * @returns {object[]} up to n items, best first (Placement > Result > Event; newer wins ties)
 */
export function selectTopN(notifications, n) {
  if (!Array.isArray(notifications) || notifications.length === 0 || n <= 0) {
    return []
  }

  const cap = Math.min(n, notifications.length)
  const heap = new MinHeap((a, b) => compareGoodness(a, b))

  for (const item of notifications) {
    if (heap.size() < cap) {
      heap.push(item)
      continue
    }
    const root = heap.peek()
    if (root !== undefined && compareGoodness(item, root) > 0) {
      heap.pop()
      heap.push(item)
    }
  }

  return heap.toSortedBestFirst()
}
