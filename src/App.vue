<template>
  <div class="app-container">
    <WelcomePage v-if="page === 'welcome'" @start="startTest" />
    <QuestionPage
      v-else-if="page === 'test'"
      :questions="shuffledQuestions"
      @complete="onComplete"
    />
    <ResultPage v-else-if="page === 'result'" :result="result" @restart="restart" />
  </div>
</template>

<script setup>
import { ref, shallowRef } from 'vue'
import WelcomePage from './components/WelcomePage.vue'
import QuestionPage from './components/QuestionPage.vue'
import ResultPage from './components/ResultPage.vue'
import { mainQuestions, specialQuestions } from './data/questions.js'
import { matchPersonality } from './engine/scoring.js'

const page = ref('welcome')
const result = shallowRef(null)
const shuffledQuestions = shallowRef([])

// Fisher-Yates 洗牌
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function startTest() {
  // 洗牌主线题，并在随机位置插入饮酒门控题
  const shuffled = shuffle(mainQuestions)
  const insertIdx = Math.floor(Math.random() * (shuffled.length + 1))
  shuffled.splice(insertIdx, 0, { ...specialQuestions.drinkGateQ1, _isSpecial: true })
  shuffledQuestions.value = shuffled
  page.value = 'test'
  window.scrollTo(0, 0)
}

function onComplete({ answers, specialAnswers }) {
  result.value = matchPersonality(answers, specialAnswers)
  page.value = 'result'
  window.scrollTo(0, 0)
}

function restart() {
  result.value = null
  page.value = 'welcome'
  window.scrollTo(0, 0)
}
</script>
