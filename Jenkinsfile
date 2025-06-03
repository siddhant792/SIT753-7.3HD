pipeline {
    agent any
    
    environment {
        APP_NAME = 'hd-project'
        VERSION = "${BUILD_NUMBER}-${env.BUILD_TIMESTAMP}"
        SONAR_HOST_URL = 'http://localhost:9000'
        SONAR_TOKEN = credentials('sonar-token')
    }

    stages {
        stage('Docker Test') {
            steps {
                script {
                    try {
                        sh '''
                            echo "Testing Docker access..."
                            export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                            /usr/local/bin/docker --version || /opt/homebrew/bin/docker --version
                            /usr/local/bin/docker-compose --version || /opt/homebrew/bin/docker-compose --version
                            /usr/local/bin/docker ps || /opt/homebrew/bin/docker ps
                            echo "Docker access verified successfully!"
                        '''
                    } catch (Exception e) {
                        echo "Docker access test failed: ${e.message}"
                        currentBuild.result = 'FAILURE'
                        throw e
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    try {
                        // Stop any existing containers
                        sh 'docker-compose down --remove-orphans || true'
                        
                        // Build and start containers
                        sh '''
                            export PATH=$PATH:/opt/homebrew/bin
                            docker-compose build --no-cache
                            docker-compose up -d
                        '''
                        
                        // Wait for services to be ready
                        sh '''
                            echo "Waiting for services to be ready..."
                            sleep 30
                            
                            # Check if frontend is accessible
                            if ! curl -f http://localhost:8081; then
                                echo "Frontend service is not accessible"
                                exit 1
                            fi
                            
                            # Check if backend is accessible
                            if ! curl -f http://localhost:3001/health; then
                                echo "Backend service is not accessible"
                                exit 1
                            fi
                            
                            echo "All services are up and running!"
                        '''
                    } catch (Exception e) {
                        echo "Deployment failed: ${e.message}"
                        currentBuild.result = 'FAILURE'
                        throw e
                    }
                }
            }
            post {
                always {
                    // Archive deployment logs
                    sh 'docker-compose logs > deployment-logs.txt'
                    archiveArtifacts artifacts: 'deployment-logs.txt', allowEmptyArchive: true
                }
                failure {
                    // Cleanup on failure
                    sh 'docker-compose down --remove-orphans || true'
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