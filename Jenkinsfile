pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-registry'
        APP_NAME = 'hd-project'
        SONAR_HOST_URL = 'http://sonarqube:9000'
        SONAR_TOKEN = credentials('sonar-token')
        SLACK_CHANNEL = '#jenkins-notifications'
        VERSION = "${BUILD_NUMBER}-${env.BUILD_TIMESTAMP}"
        DOCKER_CREDENTIALS = credentials('docker-registry-credentials')
    }

    stages {
        stage('Build') {
            steps {
                script {
                    // Version tagging
                    sh "echo \${VERSION} > version.txt"
                    
                    // Build Frontend with caching
                    dir('frontend') {
                        sh 'npm ci --prefer-offline'
                        sh 'npm run build'
                    }
                    
                    // Build Backend with caching
                    dir('backend') {
                        sh 'npm ci --prefer-offline'
                        sh 'npm run build'
                    }
                    
                    // Multi-stage Docker builds with caching
                    sh """
                        docker build --cache-from \${DOCKER_REGISTRY}/\${APP_NAME}-frontend:latest \
                            -t \${DOCKER_REGISTRY}/\${APP_NAME}-frontend:\${VERSION} \
                            -t \${DOCKER_REGISTRY}/\${APP_NAME}-frontend:latest \
                            -f frontend/Dockerfile frontend/
                        
                        docker build --cache-from \${DOCKER_REGISTRY}/\${APP_NAME}-backend:latest \
                            -t \${DOCKER_REGISTRY}/\${APP_NAME}-backend:\${VERSION} \
                            -t \${DOCKER_REGISTRY}/\${APP_NAME}-backend:latest \
                            -f backend/Dockerfile backend/
                    """
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: '**/dist/**,version.txt', fingerprint: true
                    // Push images to registry
                    sh """
                        echo \${DOCKER_CREDENTIALS} | docker login -u \${DOCKER_CREDENTIALS_USR} --password-stdin \${DOCKER_REGISTRY}
                        docker push \${DOCKER_REGISTRY}/\${APP_NAME}-frontend:\${VERSION}
                        docker push \${DOCKER_REGISTRY}/\${APP_NAME}-frontend:latest
                        docker push \${DOCKER_REGISTRY}/\${APP_NAME}-backend:\${VERSION}
                        docker push \${DOCKER_REGISTRY}/\${APP_NAME}-backend:latest
                    """
                }
            }
        }

        stage('Test') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        script {
                            dir('backend') {
                                sh 'npm run test:unit -- --coverage'
                            }
                            dir('frontend') {
                                sh 'npm run test:unit -- --coverage'
                            }
                        }
                    }
                }
                stage('Integration Tests') {
                    steps {
                        script {
                            dir('backend') {
                                sh 'npm run test:integration -- --coverage'
                            }
                        }
                    }
                }
                stage('E2E Tests') {
                    steps {
                        script {
                            dir('frontend') {
                                sh 'npm run test:e2e -- --reporter junit'
                            }
                        }
                    }
                }
                stage('Performance Tests') {
                    steps {
                        script {
                            dir('backend') {
                                sh 'npm run test:performance'
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
                    // Publish performance test results
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: '**/performance-results',
                        reportFiles: 'index.html',
                        reportName: 'Performance Test Report'
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
                                -Dsonar.projectKey=\${APP_NAME} \
                                -Dsonar.sources=. \
                                -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/** \
                                -Dsonar.javascript.lcov.reportPaths=**/coverage/lcov.info \
                                -Dsonar.testExecutionReportPaths=**/test-results/*.xml \
                                -Dsonar.qualitygate.wait=true \
                                -Dsonar.qualitygate.timeout=300 \
                                -Dsonar.qualitygate.conditions=coverage:80,duplicated_lines:3,code_smells:10 \
                                -Dsonar.technicalDebt.rating=1
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
                                sh 'npm audit --json > npm-audit-backend.json'
                                sh 'snyk test --json > snyk-backend.json'
                            }
                            dir('frontend') {
                                sh 'npm audit --json > npm-audit-frontend.json'
                                sh 'snyk test --json > snyk-frontend.json'
                            }
                        }
                    }
                }
                stage('Container Scan') {
                    steps {
                        script {
                            sh """
                                trivy image --format json --output trivy-frontend.json \${DOCKER_REGISTRY}/\${APP_NAME}-frontend:\${VERSION}
                                trivy image --format json --output trivy-backend.json \${DOCKER_REGISTRY}/\${APP_NAME}-backend:\${VERSION}
                            """
                        }
                    }
                }
                stage('SAST') {
                    steps {
                        script {
                            sh 'bandit -r . -f json -o bandit-results.json'
                            sh 'gosec -fmt json -out gosec-results.json ./...'
                        }
                    }
                }
                stage('DAST') {
                    steps {
                        script {
                            sh 'zap-cli quick-scan --self-contained --start-options "-config api.disablekey=true" http://localhost:3000'
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
                        reportFiles: '**/*.json',
                        reportName: 'Security Scan Reports'
                    ])
                }
            }
        }

        stage('Deploy to Staging') {
            steps {
                script {
                    // Deploy to Kubernetes staging environment with health checks
                    sh """
                        kubectl config use-context staging
                        helm upgrade --install \${APP_NAME} ./k8s \
                            --set image.tag=\${VERSION} \
                            --set environment=staging \
                            --set ingress.enabled=true \
                            --set ingress.host=staging.\${APP_NAME}.com \
                            --set resources.requests.cpu=100m \
                            --set resources.requests.memory=128Mi \
                            --set resources.limits.cpu=500m \
                            --set resources.limits.memory=512Mi \
                            --set livenessProbe.initialDelaySeconds=30 \
                            --set readinessProbe.initialDelaySeconds=5 \
                            --namespace staging
                    """
                    
                    // Wait for deployment to be ready
                    sh """
                        kubectl rollout status deployment/\${APP_NAME} -n staging --timeout=300s
                    """
                    
                    // Run smoke tests
                    sh 'npm run test:smoke -- --baseUrl=http://staging.\${APP_NAME}.com'
                }
            }
        }

        stage('Release') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Generate release notes
                    sh """
                        git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"%h - %s (%an)" > release-notes.txt
                    """
                    
                    // Tag the release with semantic versioning
                    sh """
                        git tag -a "v\${VERSION}" -m "Release version \${VERSION}"
                        git push origin "v\${VERSION}"
                    """
                    
                    // Deploy to production with blue/green deployment
                    sh """
                        kubectl config use-context production
                        helm upgrade --install \${APP_NAME} ./k8s \
                            --set image.tag=\${VERSION} \
                            --set environment=production \
                            --set ingress.enabled=true \
                            --set ingress.host=\${APP_NAME}.com \
                            --set resources.requests.cpu=200m \
                            --set resources.requests.memory=256Mi \
                            --set resources.limits.cpu=1000m \
                            --set resources.limits.memory=1Gi \
                            --set livenessProbe.initialDelaySeconds=30 \
                            --set readinessProbe.initialDelaySeconds=5 \
                            --set strategy.type=RollingUpdate \
                            --set strategy.rollingUpdate.maxSurge=1 \
                            --set strategy.rollingUpdate.maxUnavailable=0 \
                            --namespace production
                    """
                    
                    // Wait for deployment to be ready
                    sh """
                        kubectl rollout status deployment/\${APP_NAME} -n production --timeout=300s
                    """
                    
                    // Verify deployment
                    sh 'npm run test:smoke -- --baseUrl=http://\${APP_NAME}.com'
                }
            }
        }

        stage('Monitoring') {
            steps {
                script {
                    // Configure Prometheus monitoring with custom rules
                    sh '''
                        kubectl apply -f monitoring/prometheus-config.yaml
                        kubectl apply -f monitoring/grafana-dashboards.yaml
                        kubectl apply -f monitoring/alert-rules.yaml
                    '''
                    
                    // Set up custom dashboards
                    sh '''
                        kubectl create configmap grafana-dashboards --from-file=monitoring/grafana-dashboard.json -n monitoring
                    '''
                    
                    // Configure alerting rules
                    sh '''
                        kubectl apply -f monitoring/alert-rules.yaml
                    '''
                    
                    // Set up performance baselines
                    sh '''
                        kubectl apply -f monitoring/performance-baselines.yaml
                    '''
                }
            }
        }
    }

    post {
        always {
            // Clean up workspace
            cleanWs()
            
            // Archive all reports
            archiveArtifacts artifacts: '**/*.json,**/*.html,**/coverage/**,**/test-results/**,release-notes.txt', allowEmptyArchive: true
        }
        success {
            slackSend(
                channel: "\${SLACK_CHANNEL}",
                color: 'good',
                message: """
                    Pipeline succeeded: \${env.JOB_NAME} #\${env.BUILD_NUMBER}
                    Version: \${VERSION}
                    Changes: \${env.CHANGE_TITLE ?: 'No changes'}
                    Build URL: \${env.BUILD_URL}
                """
            )
        }
        failure {
            slackSend(
                channel: "\${SLACK_CHANNEL}",
                color: 'danger',
                message: """
                    Pipeline failed: \${env.JOB_NAME} #\${env.BUILD_NUMBER}
                    Version: \${VERSION}
                    Changes: \${env.CHANGE_TITLE ?: 'No changes'}
                    Build URL: \${env.BUILD_URL}
                    Error: \${currentBuild.description}
                """
            )
        }
    }
} 