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