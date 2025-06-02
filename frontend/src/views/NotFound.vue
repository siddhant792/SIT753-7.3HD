<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
      <router-link to="/" class="p-button p-button-primary">
        Go to Homepage
      </router-link>
    </div>
  </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem;

  .content {
    text-align: center;
    max-width: 500px;

    h1 {
      font-size: 6rem;
      color: #1976d2;
      margin: 0;
      line-height: 1;
    }

    h2 {
      font-size: 2rem;
      color: #2c3e50;
      margin: 1rem 0;
    }

    p {
      color: #666;
      margin-bottom: 2rem;
    }

    .p-button {
      min-width: 200px;
    }
  }
}
</style> 