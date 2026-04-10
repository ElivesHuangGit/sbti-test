import { dimensionOrder, dimensions } from '../data/dimensions.js'
import { standardTypes, specialTypes } from '../data/types.js'

/**
 * SBTI 评分引擎
 * 流水线: 维度求和 → L/M/H 映射 → 数值向量化 → 曼哈顿距离比对 → 排序出结果
 */

// 维度求和：每个维度2道题，分值范围 2-6
export function sumDimensions(answers) {
  const sums = {}
  for (const dim of dimensionOrder) {
    sums[dim] = 0
  }
  for (const answer of answers) {
    if (answer.dim && sums[answer.dim] !== undefined) {
      sums[answer.dim] += answer.value
    }
  }
  return sums
}

// 等级映射：≤3→L, ==4→M, ≥5→H
export function mapToLevels(sums) {
  const levels = {}
  for (const dim of dimensionOrder) {
    const s = sums[dim]
    if (s <= 3) levels[dim] = 'L'
    else if (s === 4) levels[dim] = 'M'
    else levels[dim] = 'H'
  }
  return levels
}

// 将 L/M/H 转为数值向量：L=1, M=2, H=3
function levelToNum(level) {
  if (level === 'L') return 1
  if (level === 'M') return 2
  return 3
}

// 解析类型的 pattern 字符串为数值向量
// pattern 格式: "HHH-HMH-MHH-HHH-MHM" (每组3个字符对应一个模型的3个维度)
function parsePattern(pattern) {
  const chars = pattern.replace(/-/g, '')
  return chars.split('').map(c => levelToNum(c))
}

// 计算曼哈顿距离
function manhattanDistance(v1, v2) {
  let dist = 0
  for (let i = 0; i < v1.length; i++) {
    dist += Math.abs(v1[i] - v2[i])
  }
  return dist
}

// 计算精确匹配维度数
function exactMatchCount(v1, v2) {
  let count = 0
  for (let i = 0; i < v1.length; i++) {
    if (v1[i] === v2[i]) count++
  }
  return count
}

// 用户等级映射转数值向量
function levelsToVector(levels) {
  return dimensionOrder.map(dim => levelToNum(levels[dim]))
}

// 用户等级映射转 pattern 字符串
function levelsToPattern(levels) {
  const groups = []
  for (let i = 0; i < dimensionOrder.length; i += 3) {
    const g = dimensionOrder.slice(i, i + 3).map(d => levels[d]).join('')
    groups.push(g)
  }
  return groups.join('-')
}

/**
 * 主匹配函数
 * @param {Object} answers - 用户答案数组 [{dim, value}, ...]
 * @param {Object} specialAnswers - 特殊题答案 {drinkGateQ1, drinkGateQ2}
 * @returns {Object} 匹配结果
 */
export function matchPersonality(answers, specialAnswers = {}) {
  // 1. 检查 DRUNK 隐藏人格
  if (specialAnswers.drinkGateQ1 === 3 && specialAnswers.drinkGateQ2 === 2) {
    const sums = sumDimensions(answers)
    const levels = mapToLevels(sums)
    const userVector = levelsToVector(levels)
    const userPattern = levelsToPattern(levels)

    // DRUNK 人格被激活，但仍然计算最佳匹配作为副人格
    const rankings = rankTypes(userVector)
    const drunkType = specialTypes.find(t => t.code === 'DRUNK')

    return {
      type: drunkType,
      isDrunk: true,
      secondaryType: rankings[0].type,
      similarity: rankings[0].similarity,
      sums,
      levels,
      userPattern,
      rankings: rankings.slice(0, 5)
    }
  }

  // 2. 标准匹配流程
  const sums = sumDimensions(answers)
  const levels = mapToLevels(sums)
  const userVector = levelsToVector(levels)
  const userPattern = levelsToPattern(levels)

  const rankings = rankTypes(userVector)
  const bestMatch = rankings[0]

  // 3. 检查 HHHH 兜底
  if (bestMatch.similarity < 0.6) {
    const hhhhType = specialTypes.find(t => t.code === 'HHHH')
    return {
      type: hhhhType,
      isHHHH: true,
      secondaryType: bestMatch.type,
      similarity: bestMatch.similarity,
      sums,
      levels,
      userPattern,
      rankings: rankings.slice(0, 5)
    }
  }

  // 4. 正常结果
  return {
    type: bestMatch.type,
    similarity: bestMatch.similarity,
    exactCount: bestMatch.exactCount,
    sums,
    levels,
    userPattern,
    rankings: rankings.slice(0, 5)
  }
}

// 对所有标准类型排序
function rankTypes(userVector) {
  const results = standardTypes.map(type => {
    const typeVector = parsePattern(type.pattern)
    const dist = manhattanDistance(userVector, typeVector)
    const similarity = 1 - dist / 30 // 最大距离 = 15维 × 2 = 30
    const exact = exactMatchCount(userVector, typeVector)

    return {
      type,
      distance: dist,
      similarity,
      exactCount: exact
    }
  })

  // 排序规则：距离升序 → 精确匹配数降序 → 相似度降序
  results.sort((a, b) => {
    if (a.distance !== b.distance) return a.distance - b.distance
    if (a.exactCount !== b.exactCount) return b.exactCount - a.exactCount
    return b.similarity - a.similarity
  })

  return results
}

/**
 * 获取维度详细解读
 */
export function getDimensionExplanations(levels) {
  return dimensionOrder.map(dim => ({
    dim,
    name: dimensions[dim].name,
    model: dimensions[dim].model,
    level: levels[dim],
    explanation: dimensions[dim].levels[levels[dim]]
  }))
}
