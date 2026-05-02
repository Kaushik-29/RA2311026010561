import { typeRank } from './priority.js'

/** @param {string} type */
export function getPriorityTier(type) {
  const r = typeRank(type)
  if (r === 3) return 'high'
  if (r === 2) return 'medium'
  return 'low'
}
