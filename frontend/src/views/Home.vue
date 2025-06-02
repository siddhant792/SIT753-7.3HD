<template>
  <div class="home">
    <div class="hero">
      <h1>Task Management Platform</h1>
      <p class="subtitle">Streamline your workflow with our powerful task management solution</p>
      <div class="cta-buttons">
        <router-link to="/register" class="p-button p-button-primary">
          Get Started
        </router-link>
        <router-link to="/login" class="p-button p-button-secondary">
          Login
        </router-link>
      </div>
    </div>

    <div class="features">
      <div class="feature-card">
        <i class="pi pi-list feature-icon"></i>
        <h3>Task Management</h3>
        <p>Create, assign, and track tasks with ease</p>
      </div>

      <div class="feature-card">
        <i class="pi pi-users feature-icon"></i>
        <h3>Team Collaboration</h3>
        <p>Work together seamlessly with your team</p>
      </div>

      <div class="feature-card">
        <i class="pi pi-chart-line feature-icon"></i>
        <h3>Analytics</h3>
        <p>Track progress and performance metrics</p>
      </div>

      <div class="feature-card">
        <i class="pi pi-bell feature-icon"></i>
        <h3>Real-time Updates</h3>
        <p>Stay informed with instant notifications</p>
      </div>
    </div>

    <div class="pricing">
      <h2>Pricing Plans</h2>
      <div class="pricing-cards">
        <div class="pricing-card">
          <h3>Free</h3>
          <div class="price">$0</div>
          <ul>
            <li>Up to 5 users</li>
            <li>Basic task management</li>
            <li>Email support</li>
          </ul>
          <router-link to="/register" class="p-button p-button-outlined">
            Start Free
          </router-link>
        </div>

        <div class="pricing-card featured">
          <h3>Pro</h3>
          <div class="price">$10<span>/month</span></div>
          <ul>
            <li>Up to 20 users</li>
            <li>Advanced task management</li>
            <li>Priority support</li>
            <li>Analytics dashboard</li>
          </ul>
          <router-link to="/register" class="p-button p-button-primary">
            Get Pro
          </router-link>
        </div>

        <div class="pricing-card">
          <h3>Enterprise</h3>
          <div class="price">Custom</div>
          <ul>
            <li>Unlimited users</li>
            <li>Custom features</li>
            <li>24/7 support</li>
            <li>Dedicated account manager</li>
          </ul>
          <router-link to="/register" class="p-button p-button-outlined">
            Contact Sales
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
.home {
  .hero {
    text-align: center;
    padding: 4rem 2rem;
    background: linear-gradient(135deg, #1976d2 0%, #64b5f6 100%);
    color: white;

    h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .subtitle {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;

      .p-button {
        min-width: 150px;
      }
    }
  }

  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    padding: 4rem 2rem;
    background-color: #f8f9fa;

    .feature-card {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-5px);
      }

      .feature-icon {
        font-size: 2.5rem;
        color: #1976d2;
        margin-bottom: 1rem;
      }

      h3 {
        margin-bottom: 1rem;
        color: #2c3e50;
      }

      p {
        color: #666;
      }
    }
  }

  .pricing {
    padding: 4rem 2rem;
    text-align: center;

    h2 {
      margin-bottom: 3rem;
      color: #2c3e50;
    }

    .pricing-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;

      .pricing-card {
        padding: 2rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        &.featured {
          transform: scale(1.05);
          border: 2px solid #1976d2;
        }

        h3 {
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .price {
          font-size: 2.5rem;
          font-weight: bold;
          color: #1976d2;
          margin-bottom: 1.5rem;

          span {
            font-size: 1rem;
            color: #666;
          }
        }

        ul {
          list-style: none;
          padding: 0;
          margin-bottom: 2rem;

          li {
            padding: 0.5rem 0;
            color: #666;
          }
        }

        .p-button {
          width: 100%;
        }
      }
    }
  }
}
</style> 