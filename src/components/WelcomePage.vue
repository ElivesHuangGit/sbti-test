<template>
  <div class="welcome-page">
    <div class="welcome-card">
      <div class="logo-area">
        <div class="logo-text">SBTI</div>
        <div class="logo-subtitle">Silly Big Personality Test</div>
      </div>

      <h1 class="title">SBTI 人格测试</h1>
      <p class="subtitle">傻乎乎的大人格测试</p>

      <div class="info-box">
        <div class="info-item">
          <span class="info-icon">&#x1F9E0;</span>
          <span>30道题</span>
        </div>
        <div class="info-item">
          <span class="info-icon">&#x23F1;</span>
          <span>约3-5分钟</span>
        </div>
        <div class="info-item">
          <span class="info-icon">&#x1F3AD;</span>
          <span>27种人格</span>
        </div>
      </div>

      <div class="desc-section">
        <p>五大心理模型 / 十五维度交叉分析</p>
        <p>为你匹配最贴合的抽象人格标签</p>
      </div>

      <div class="models-preview">
        <span class="model-tag">自我模型</span>
        <span class="model-tag">情感模型</span>
        <span class="model-tag">态度模型</span>
        <span class="model-tag">行动驱力</span>
        <span class="model-tag">社交模型</span>
      </div>

      <button class="start-btn" @click="$emit('start')">
        <span>开始测试</span>
        <span class="btn-arrow">&rarr;</span>
      </button>

      <p class="disclaimer">
        本测试仅供娱乐，请勿当真。不可作为诊断、面试、相亲、分手、驱邪、算命或人生审判的依据。
      </p>
    </div>
  </div>
</template>

<script setup>
defineEmits(['start'])
</script>

<style scoped>
.welcome-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.welcome-card {
  max-width: 520px;
  width: 100%;
  text-align: center;
  animation: fadeInUp 0.6s ease-out;
}

.logo-area {
  margin-bottom: 32px;
}

.logo-text {
  font-size: 72px;
  font-weight: 900;
  letter-spacing: 8px;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 8px;
}

.logo-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  letter-spacing: 4px;
  text-transform: uppercase;
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.info-box {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 28px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
  background: var(--card-bg);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
}

.info-icon {
  font-size: 16px;
}

.desc-section {
  margin-bottom: 24px;
}

.desc-section p {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.8;
}

.models-preview {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 36px;
}

.model-tag {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  background: var(--accent-light);
  color: var(--accent);
  border: 1px solid rgba(74, 124, 94, 0.25);
}

.start-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 48px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  background: var(--accent-gradient);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(74, 124, 94, 0.3);
  margin-bottom: 24px;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 28px rgba(74, 124, 94, 0.4);
}

.start-btn:active {
  transform: translateY(0);
}

.btn-arrow {
  font-size: 20px;
  transition: transform 0.3s;
}

.start-btn:hover .btn-arrow {
  transform: translateX(4px);
}

.disclaimer {
  font-size: 12px;
  color: var(--text-muted);
  max-width: 360px;
  margin: 0 auto;
  line-height: 1.6;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
