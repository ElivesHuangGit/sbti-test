<template>
  <div class="question-page">
    <!-- 进度条 -->
    <div class="progress-bar-container">
      <div class="progress-info">
        <span class="progress-text">{{ currentIndex + 1 }} / {{ totalCount }}</span>
        <span class="progress-percent">{{ progressPercent }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>

    <!-- 问题卡片 -->
    <div class="question-card" :key="currentQuestion.id">
      <div class="question-number">Q{{ currentIndex + 1 }}</div>
      <div class="question-text">{{ currentQuestion.text }}</div>

      <div class="options-list">
        <button
          v-for="(opt, idx) in currentQuestion.options"
          :key="idx"
          class="option-btn"
          :class="{ selected: selectedOption === idx }"
          @click="selectOption(idx, opt)"
        >
          <span class="option-label">{{ optionLabels[idx] }}</span>
          <span class="option-text">{{ opt.label }}</span>
        </button>
      </div>
    </div>

    <!-- 导航按钮 -->
    <div class="nav-buttons">
      <button
        class="nav-btn prev-btn"
        :disabled="currentIndex === 0"
        @click="prevQuestion"
      >
        &larr; 上一题
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { specialQuestions } from '../data/questions.js'

const props = defineProps({
  questions: { type: Array, required: true }
})

const emit = defineEmits(['complete'])

// 动态题目列表（可能因饮酒题动态插入）
const dynamicQuestions = ref([...props.questions])
const currentIndex = ref(0)
const selectedOption = ref(null)

// 存储所有答案
const answerMap = ref({}) // { questionId: { dim, value, optionIndex } }
const specialAnswers = ref({ drinkGateQ1: null, drinkGateQ2: null })

// 标记饮酒追加题是否已插入
const drinkQ2Inserted = ref(false)

const optionLabels = ['A', 'B', 'C', 'D']

const currentQuestion = computed(() => dynamicQuestions.value[currentIndex.value])

const totalCount = computed(() => dynamicQuestions.value.length)

const progressPercent = computed(() =>
  Math.round(((currentIndex.value) / totalCount.value) * 100)
)

function selectOption(idx, opt) {
  selectedOption.value = idx
  const q = currentQuestion.value

  // 记录答案
  if (q._isSpecial && q.kind === 'drink_gate') {
    specialAnswers.value.drinkGateQ1 = opt.value
    // 如果选了"饮酒"，在当前题后面插入追加题
    if (opt.value === 3 && !drinkQ2Inserted.value) {
      const q2 = { ...specialQuestions.drinkGateQ2, _isSpecial: true }
      dynamicQuestions.value.splice(currentIndex.value + 1, 0, q2)
      drinkQ2Inserted.value = true
    } else if (opt.value !== 3 && drinkQ2Inserted.value) {
      // 如果反悔不选饮酒了，移除追加题
      const q2Idx = dynamicQuestions.value.findIndex(
        qq => qq._isSpecial && qq.kind === 'drink_trigger'
      )
      if (q2Idx > -1) {
        dynamicQuestions.value.splice(q2Idx, 1)
        drinkQ2Inserted.value = false
        specialAnswers.value.drinkGateQ2 = null
      }
    }
  } else if (q._isSpecial && q.kind === 'drink_trigger') {
    specialAnswers.value.drinkGateQ2 = opt.value
  } else {
    // 普通题 - 记录维度和分值
    answerMap.value[q.id] = { dim: q.dim, value: opt.value }
  }

  // 自动前进到下一题（延迟一点以显示选中效果）
  setTimeout(() => {
    if (currentIndex.value < totalCount.value - 1) {
      currentIndex.value++
      selectedOption.value = getStoredOption()
    } else {
      // 最后一题，完成测试
      finishTest()
    }
  }, 300)
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    selectedOption.value = getStoredOption()
  }
}

function getStoredOption() {
  const q = dynamicQuestions.value[currentIndex.value]
  if (q._isSpecial && q.kind === 'drink_gate') {
    if (specialAnswers.value.drinkGateQ1 !== null) {
      return q.options.findIndex(o => o.value === specialAnswers.value.drinkGateQ1)
    }
  } else if (q._isSpecial && q.kind === 'drink_trigger') {
    if (specialAnswers.value.drinkGateQ2 !== null) {
      return q.options.findIndex(o => o.value === specialAnswers.value.drinkGateQ2)
    }
  } else if (answerMap.value[q.id]) {
    return q.options.findIndex(o => o.value === answerMap.value[q.id].value)
  }
  return null
}

function finishTest() {
  const answers = Object.values(answerMap.value)
  emit('complete', {
    answers,
    specialAnswers: specialAnswers.value
  })
}
</script>

<style scoped>
.question-page {
  min-height: 100vh;
  padding: 20px;
  max-width: 640px;
  margin: 0 auto;
}

.progress-bar-container {
  position: sticky;
  top: 0;
  background: var(--bg-primary);
  padding: 16px 0;
  z-index: 10;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.progress-percent {
  font-size: 14px;
  color: var(--text-secondary);
}

.progress-bar {
  height: 6px;
  background: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent-gradient);
  border-radius: 3px;
  transition: width 0.4s ease;
}

.question-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 32px 24px;
  margin-top: 24px;
  animation: fadeIn 0.3s ease-out;
}

.question-number {
  display: inline-block;
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
  background: var(--accent-light);
  padding: 4px 12px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.question-text {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-primary);
  margin-bottom: 28px;
  word-break: break-word;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-btn {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 16px;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-size: 15px;
  color: var(--text-primary);
}

.option-btn:hover {
  border-color: var(--accent);
  background: rgba(74, 124, 94, 0.05);
}

.option-btn.selected {
  border-color: var(--accent);
  background: var(--accent-light);
}

.option-label {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--border-color);
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.option-btn.selected .option-label {
  background: var(--accent);
  color: #fff;
}

.option-text {
  flex: 1;
  line-height: 1.6;
  padding-top: 3px;
}

.nav-buttons {
  display: flex;
  justify-content: flex-start;
  margin-top: 24px;
  padding-bottom: 40px;
}

.nav-btn {
  padding: 10px 20px;
  font-size: 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
