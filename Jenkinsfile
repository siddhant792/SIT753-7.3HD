pipeline {
    agent any
    
    environment {
        APP_NAME = 'hd-project'
        VERSION = "${BUILD_NUMBER}-${env.BUILD_TIMESTAMP}"
    }

    stages {
        stage('Build') {
            steps {
                script {
                    // Version tagging
                    sh 'echo ${VERSION} > version.txt'
                    
                    // Build Frontend
                    dir('frontend') {
                        sh 'npm ci'
                        sh 'npm run build'
                    }
                    
                    // Build Backend
                    dir('backend') {
                        sh 'npm ci'
                        sh 'npm run build'
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
                        sh 'npm run test:unit'
                    }
                    dir('frontend') {
                        sh 'npm run test:unit'
                    }
                    
                    // Run integration tests
                    dir('backend') {
                        sh 'npm run test:integration'
                    }
                }
            }
            post {
                always {
                    // Publish test results
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
                    // Run ESLint for frontend
                    dir('frontend') {
                        sh 'npm run lint'
                    }
                    
                    // Run ESLint for backend
                    dir('backend') {
                        sh 'npm run lint'
                    }
                    
                    // Generate code coverage reports
                    dir('frontend') {
                        sh 'npm run test:coverage'
                    }
                    dir('backend') {
                        sh 'npm run test:coverage'
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
                        reportDir: '**/coverage',
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
                        sh 'npm audit --json > npm-audit-frontend.json'
                    }
                    dir('backend') {
                        sh 'npm audit --json > npm-audit-backend.json'
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
            // Clean up workspace
            cleanWs()
            // Archive all reports
            archiveArtifacts artifacts: '**/*.json,**/*.html,**/coverage/**,**/test-results/**,version.txt', allowEmptyArchive: true
        }
    }
} 