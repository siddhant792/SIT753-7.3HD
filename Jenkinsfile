pipeline {
    agent any
    
    environment {
        APP_NAME = 'hd-project'
        VERSION = "${BUILD_NUMBER}-${env.BUILD_TIMESTAMP}"
        SONAR_HOST_URL = 'http://localhost:9000'
        SONAR_TOKEN = credentials('sonar-token')
        DOCKER_PATH = '/usr/local/bin:/opt/homebrew/bin'
        NODE_VERSION = '18'
    }

    stages {

        stage('Build') {
            steps {
                script {
                    // Version tagging
                    sh 'echo ${VERSION} > version.txt'
                    
                    // Build Frontend
                    dir('frontend') {
                        sh '''
                            export PATH=$PATH:/opt/homebrew/bin
                            npm install
                            npm ci
                        '''
                        sh '''
                            export PATH=$PATH:/opt/homebrew/bin
                            npm run build
                        '''
                    }
                    
                    // Build Backend
                    dir('backend') {
                        sh '''
                            export PATH=$PATH:/opt/homebrew/bin
                            npm ci
                        '''
                        sh '''
                            export PATH=$PATH:/opt/homebrew/bin
                            npm run build
                        '''
                    }
                }
            }
            post {
                success {
                    // Archive build artifacts
                    archiveArtifacts artifacts: '**/dist/**,version.txt', fingerprint: true
                }
            }
        }

        stage('Test') {
            steps {
                script {
                    // Run unit tests
                    dir('backend') {
                        try {
                            sh '''
                                export PATH=$PATH:/opt/homebrew/bin
                                npm run test:unit
                            '''
                        } catch (Exception e) {
                            echo "Backend unit tests failed: ${e.message}"
                            currentBuild.result = 'UNSTABLE'
                        }
                    }
                    dir('frontend') {
                        try {
                            sh '''
                                export PATH=$PATH:/opt/homebrew/bin
                                npm run test:unit
                            '''
                        } catch (Exception e) {
                            echo "Frontend unit tests failed: ${e.message}"
                            currentBuild.result = 'UNSTABLE'
                        }
                    }
                    
                    // Run integration tests
                    dir('backend') {
                        try {
                            sh '''
                                export PATH=$PATH:/opt/homebrew/bin
                                npm run test:integration
                            '''
                        } catch (Exception e) {
                            echo "Backend integration tests failed: ${e.message}"
                            currentBuild.result = 'UNSTABLE'
                        }
                    }

                    // Run frontend coverage tests
                    dir('frontend') {
                        sh '''
                            export PATH=$PATH:/opt/homebrew/bin
                            npm run test:coverage
                        '''
                    }
                }
            }
            post {
                always {
                    // Publish test results
                    junit '**/test-results/*.xml'
                    
                    // Publish test coverage reports
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'frontend/coverage',
                        reportFiles: 'index.html',
                        reportName: 'Frontend Test Coverage'
                    ])
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'backend/coverage',
                        reportFiles: 'index.html',
                        reportName: 'Backend Test Coverage'
                    ])

                    // Archive test artifacts
                    archiveArtifacts artifacts: '**/test-results/**,**/coverage/**', allowEmptyArchive: true
                }
            }
        }

        stage('Code Quality') {
            steps {
                script {
                    // Run ESLint for frontend
                    dir('frontend') {
                        sh '''
                            export PATH=$PATH:/opt/homebrew/bin
                            npm run lint
                        '''
                    }
                    
                    // Run ESLint for backend
                    dir('backend') {
                        sh '''
                            export PATH=$PATH:/opt/homebrew/bin
                            npm run lint
                        '''
                    }
                    
                    // Generate code coverage reports
                    dir('frontend') {
                        sh '''
                            export PATH=$PATH:/opt/homebrew/bin
                            npm run test:coverage
                        '''
                    }
                    dir('backend') {
                        sh '''
                            export PATH=$PATH:/opt/homebrew/bin
                            npm run test:coverage
                        '''
                    }

                    // Run SonarQube analysis
                    withSonarQubeEnv('SonarQube') {
                        sh '''
                            export PATH=$PATH:/opt/homebrew/bin
                            # Analyze frontend
                            cd frontend
                            sonar-scanner \
                                -Dsonar.projectKey=${APP_NAME}-frontend \
                                -Dsonar.sources=src \
                                -Dsonar.tests=src \
                                -Dsonar.test.inclusions=**/*.test.tsx,**/*.test.ts \
                                -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info \
                                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                                -Dsonar.coverage.exclusions=**/*.test.tsx,**/*.test.ts \
                                -Dsonar.host.url=${SONAR_HOST_URL} \
                                -Dsonar.login=${SONAR_TOKEN}

                            # Analyze backend
                            cd ../backend
                            sonar-scanner \
                                -Dsonar.projectKey=${APP_NAME}-backend \
                                -Dsonar.sources=src \
                                -Dsonar.tests=src \
                                -Dsonar.test.inclusions=**/*.test.ts \
                                -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info \
                                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                                -Dsonar.coverage.exclusions=**/*.test.ts \
                                -Dsonar.host.url=${SONAR_HOST_URL} \
                                -Dsonar.login=${SONAR_TOKEN}
                        '''
                    }
                }
            }
            post {
                always {
                    // Publish code quality reports
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'backend/coverage',
                        reportFiles: 'index.html',
                        reportName: 'Code Coverage Report'
                    ])
                }
            }
        }

        stage('Security') {
            steps {
                script {
                    // Run npm audit for both frontend and backend
                    dir('frontend') {
                        try {
                            sh '''
                                export PATH=$PATH:/opt/homebrew/bin
                                echo "Running security audit for frontend..."
                                npm audit
                            '''
                        } catch (Exception e) {
                            echo "Frontend security check failed: ${e.message}"
                            currentBuild.result = 'UNSTABLE'
                        }
                    }
                    
                    dir('backend') {
                        try {
                            sh '''
                                export PATH=$PATH:/opt/homebrew/bin
                                echo "Running security audit for backend..."
                                npm audit
                            '''
                        } catch (Exception e) {
                            echo "Backend security check failed: ${e.message}"
                            currentBuild.result = 'UNSTABLE'
                        }
                    }
                }
            }
            post {
                always {
                    // Archive security reports
                    archiveArtifacts artifacts: '**/npm-audit-*.json', allowEmptyArchive: true
                }
            }
        }
    }

    post {
        always {
            // Archive all reports first
            archiveArtifacts artifacts: '**/*.json,**/*.html,**/coverage/**,**/test-results/**,version.txt', allowEmptyArchive: true
            // Clean up workspace after archiving
            cleanWs()
        }
    }
} 