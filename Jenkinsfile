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
        stage('Docker Test') {
            steps {
                script {
                    try {
                        sh '''
                            echo "Testing Docker access..."
                            export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                            /usr/local/bin/docker --version || /opt/homebrew/bin/docker --version
                            /usr/local/bin/docker ps
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
                        // Stop and remove existing containers
                        sh '''
                            export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                            /usr/local/bin/docker stop frontend backend postgres || true
                            /usr/local/bin/docker rm frontend backend postgres || true
                        '''
                        
                        // Build frontend
                        dir('frontend') {
                            sh '''
                                export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                                echo "Building frontend application..."
                                
                                # Install dependencies
                                npm ci
                                
                                # Build Vue application
                                npm run build
                                
                                # Verify build output
                                if [ ! -d "dist" ]; then
                                    echo "Build failed: dist directory not found"
                                    exit 1
                                fi
                            '''
                        }
                        
                        // Build backend
                        dir('backend') {
                            sh '''
                                export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                                echo "Building backend application..."
                                npm ci
                                npm run build
                            '''
                        }
                        
                        // Build Docker images
                        sh '''
                            export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                            echo "Building frontend Docker image..."
                            /usr/local/bin/docker build -t ${APP_NAME}-frontend:${VERSION} ./frontend
                            
                            echo "Building backend Docker image..."
                            /usr/local/bin/docker build -t ${APP_NAME}-backend:${VERSION} ./backend
                        '''
                        
                        // Start containers
                        sh '''
                            export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                            
                            # Start PostgreSQL
                            echo "Starting PostgreSQL..."
                            /usr/local/bin/docker run -d \
                                --name postgres \
                                -e POSTGRES_DB=task_management \
                                -e POSTGRES_USER=postgres \
                                -e POSTGRES_PASSWORD=postgres \
                                -p 5432:5432 \
                                postgres:14-alpine
                            
                            # Wait for PostgreSQL to be ready
                            echo "Waiting for PostgreSQL to be ready..."
                            sleep 10
                            
                            # Start Backend
                            echo "Starting Backend..."
                            /usr/local/bin/docker run -d \
                                --name backend \
                                --link postgres \
                                -e NODE_ENV=development \
                                -e PORT=3001 \
                                -e DB_HOST=postgres \
                                -e DB_PORT=5432 \
                                -e DB_NAME=task_management \
                                -e DB_USER=postgres \
                                -e DB_PASSWORD=postgres \
                                -p 3001:3001 \
                                ${APP_NAME}-backend:${VERSION}
                            
                            # Wait for Backend to be ready
                            echo "Waiting for Backend to be ready..."
                            sleep 20
                            
                            # Start Frontend
                            echo "Starting Frontend..."
                            /usr/local/bin/docker run -d \
                                --name frontend \
                                --link backend \
                                -e VITE_API_URL=http://localhost:3001 \
                                -e VITE_WS_URL=ws://localhost:3001 \
                                -p 8081:80 \
                                ${APP_NAME}-frontend:${VERSION}
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
                    sh '''
                        export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                        echo "=== Frontend Logs ===" > deployment-logs.txt
                        /usr/local/bin/docker logs frontend >> deployment-logs.txt
                        echo -e "\n=== Backend Logs ===" >> deployment-logs.txt
                        /usr/local/bin/docker logs backend >> deployment-logs.txt
                        echo -e "\n=== PostgreSQL Logs ===" >> deployment-logs.txt
                        /usr/local/bin/docker logs postgres >> deployment-logs.txt
                    '''
                    archiveArtifacts artifacts: 'deployment-logs.txt', allowEmptyArchive: true
                }
                failure {
                    // Cleanup on failure
                    sh '''
                        export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                        /usr/local/bin/docker stop frontend backend postgres || true
                        /usr/local/bin/docker rm frontend backend postgres || true
                    '''
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