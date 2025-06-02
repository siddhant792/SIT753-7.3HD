pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-registry'
        APP_NAME = 'hd-project'
        SONAR_HOST_URL = 'http://sonarqube:9000'
        SONAR_TOKEN = credentials('sonar-token')
        SLACK_CHANNEL = '#jenkins-notifications'
    }

    stages {
        stage('Build') {
            steps {
                script {
                    // Build Frontend
                    dir('frontend') {
                        sh 'npm install'
                        sh 'npm run build'
                    }
                    
                    // Build Backend
                    dir('backend') {
                        sh 'npm install'
                        sh 'npm run build'
                    }
                    
                    // Build Docker images
                    sh """
                        docker build -t ${DOCKER_REGISTRY}/${APP_NAME}-frontend:${BUILD_NUMBER} -f frontend/Dockerfile frontend/
                        docker build -t ${DOCKER_REGISTRY}/${APP_NAME}-backend:${BUILD_NUMBER} -f backend/Dockerfile backend/
                    """
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: '**/dist/**', fingerprint: true
                }
            }
        }

        stage('Test') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        script {
                            dir('backend') {
                                sh 'npm run test:unit'
                            }
                            dir('frontend') {
                                sh 'npm run test:unit'
                            }
                        }
                    }
                }
                stage('Integration Tests') {
                    steps {
                        script {
                            dir('backend') {
                                sh 'npm run test:integration'
                            }
                        }
                    }
                }
                stage('E2E Tests') {
                    steps {
                        script {
                            dir('frontend') {
                                sh 'npm run test:e2e'
                            }
                        }
                    }
                }
            }
            post {
                always {
                    junit '**/test-results/*.xml'
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: '**/coverage',
                        reportFiles: 'index.html',
                        reportName: 'Test Coverage Report'
                    ])
                }
            }
        }

        stage('Code Quality') {
            steps {
                script {
                    withSonarQubeEnv('SonarQube') {
                        sh """
                            sonar-scanner \
                                -Dsonar.projectKey=${APP_NAME} \
                                -Dsonar.sources=. \
                                -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/** \
                                -Dsonar.javascript.lcov.reportPaths=**/coverage/lcov.info \
                                -Dsonar.testExecutionReportPaths=**/test-results/*.xml
                        """
                    }
                }
            }
        }

        stage('Security') {
            parallel {
                stage('Dependency Check') {
                    steps {
                        script {
                            dir('backend') {
                                sh 'npm audit'
                            }
                            dir('frontend') {
                                sh 'npm audit'
                            }
                        }
                    }
                }
                stage('Container Scan') {
                    steps {
                        script {
                            sh """
                                trivy image ${DOCKER_REGISTRY}/${APP_NAME}-frontend:${BUILD_NUMBER}
                                trivy image ${DOCKER_REGISTRY}/${APP_NAME}-backend:${BUILD_NUMBER}
                            """
                        }
                    }
                }
                stage('SAST') {
                    steps {
                        script {
                            sh 'bandit -r . -f json -o bandit-results.json'
                        }
                    }
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: '.',
                        reportFiles: 'bandit-results.json',
                        reportName: 'Security Scan Report'
                    ])
                }
            }
        }

        stage('Deploy to Staging') {
            steps {
                script {
                    // Deploy to Kubernetes staging environment
                    sh """
                        kubectl config use-context staging
                        helm upgrade --install ${APP_NAME} ./k8s \
                            --set image.tag=${BUILD_NUMBER} \
                            --set environment=staging \
                            --namespace staging
                    """
                }
            }
        }

        stage('Release') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Tag the release
                    sh """
                        git tag -a "v${BUILD_NUMBER}" -m "Release version ${BUILD_NUMBER}"
                        git push origin "v${BUILD_NUMBER}"
                    """
                    
                    // Deploy to production
                    sh """
                        kubectl config use-context production
                        helm upgrade --install ${APP_NAME} ./k8s \
                            --set image.tag=${BUILD_NUMBER} \
                            --set environment=production \
                            --namespace production
                    """
                }
            }
        }

        stage('Monitoring') {
            steps {
                script {
                    // Configure Prometheus monitoring
                    sh """
                        kubectl apply -f monitoring/prometheus-config.yaml
                        kubectl apply -f monitoring/grafana-dashboards.yaml
                    """
                    
                    // Set up alerting rules
                    sh 'kubectl apply -f monitoring/alert-rules.yaml'
                }
            }
        }
    }

    post {
        always {
            // Clean up workspace
            cleanWs()
        }
        success {
            slackSend(
                channel: "${SLACK_CHANNEL}",
                color: 'good',
                message: "Pipeline succeeded: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )
        }
        failure {
            slackSend(
                channel: "${SLACK_CHANNEL}",
                color: 'danger',
                message: "Pipeline failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )
        }
    }
} 