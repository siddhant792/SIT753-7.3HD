pipeline {
    agent any
    
    environment {
        APP_NAME = 'hd-project'
        VERSION = "${BUILD_NUMBER}-${env.BUILD_TIMESTAMP}"
        PROD_VERSION = "prod-${BUILD_NUMBER}"
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
                                
                                # Clean install dependencies and update package-lock.json
                                echo "Installing dependencies..."
                                rm -rf node_modules package-lock.json
                                npm install
                                
                                # Fix vulnerabilities
                                echo "Fixing npm vulnerabilities..."
                                npm audit fix --force || true
                                
                                # Update npm
                                echo "Updating npm..."
                                npm install -g npm@latest
                                
                                # Build Vue application
                                echo "Building Vue application..."
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
                            /usr/local/bin/docker build --no-cache -t ${APP_NAME}-frontend:${VERSION} ./frontend
                            
                            echo "Building backend Docker image..."
                            /usr/local/bin/docker build -t ${APP_NAME}-backend:${VERSION} ./backend
                        '''
                        
                        // Start containers
                        sh '''
                            export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                            
                            # Create a custom network
                            echo "Creating custom network..."
                            /usr/local/bin/docker network create hd-network || true
                            
                            # Start PostgreSQL
                            echo "Starting PostgreSQL..."
                            /usr/local/bin/docker run -d \
                                --name postgres \
                                --network hd-network \
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
                                --network hd-network \
                                -e NODE_ENV=development \
                                -e PORT=3001 \
                                -e DATABASE_URL=postgres://postgres:postgres@postgres:5432/task_management \
                                -e JWT_SECRET=your-super-secret-jwt-key-here \
                                -e JWT_EXPIRES_IN=24h \
                                -p 3001:3001 \
                                ${APP_NAME}-backend:${VERSION}
                            
                            # Wait for Backend to be ready
                            echo "Waiting for Backend to be ready..."
                            sleep 20
                            
                            # Verify backend is running
                            if ! curl -f http://localhost:3001/health; then
                                echo "Backend failed to start properly"
                                exit 1
                            fi
                            
                            # Start Frontend
                            echo "Starting Frontend..."
                            /usr/local/bin/docker run -d \
                                --name frontend \
                                --network hd-network \
                                -e VITE_API_URL=http://localhost:3001 \
                                -e VITE_WS_URL=ws://localhost:3001 \
                                -e VITE_BASE_URL=http://localhost:3001 \
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

        stage('Release') {
            when {
                expression { 
                    // Only run release stage if deployment was successful
                    return currentBuild.currentResult == 'SUCCESS'
                }
            }
            steps {
                script {
                    try {
                        // Tag images for production
                        sh '''
                            export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                            echo "Tagging images for production..."
                            /usr/local/bin/docker tag ${APP_NAME}-frontend:${VERSION} ${APP_NAME}-frontend:${PROD_VERSION}
                            /usr/local/bin/docker tag ${APP_NAME}-backend:${VERSION} ${APP_NAME}-backend:${PROD_VERSION}
                        '''

                        // Deploy to production environment
                        sh '''
                            export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                            
                            # Create production network if it doesn't exist
                            echo "Creating production network..."
                            /usr/local/bin/docker network create hd-network-prod || true
                            
                            # Stop and remove existing production containers
                            echo "Cleaning up existing production containers..."
                            /usr/local/bin/docker stop frontend-prod backend-prod postgres-prod || true
                            /usr/local/bin/docker rm frontend-prod backend-prod postgres-prod || true
                            
                            # Start PostgreSQL for production
                            echo "Starting PostgreSQL for production..."
                            /usr/local/bin/docker run -d \
                                --name postgres-prod \
                                --network hd-network-prod \
                                -e POSTGRES_DB=task_management \
                                -e POSTGRES_USER=postgres \
                                -e POSTGRES_PASSWORD=postgres \
                                -p 5433:5432 \
                                postgres:14-alpine
                            
                            # Wait for PostgreSQL to be ready
                            echo "Waiting for PostgreSQL to be ready..."
                            sleep 10
                            
                            # Start Backend for production
                            echo "Starting Backend for production..."
                            /usr/local/bin/docker run -d \
                                --name backend-prod \
                                --network hd-network-prod \
                                -e NODE_ENV=production \
                                -e PORT=3002 \
                                -e DATABASE_URL=postgres://postgres:postgres@postgres-prod:5432/task_management \
                                -e JWT_SECRET=your-super-secret-jwt-key-here \
                                -e JWT_EXPIRES_IN=24h \
                                -p 3002:3002 \
                                ${APP_NAME}-backend:${PROD_VERSION}
                            
                            # Wait for Backend to be ready
                            echo "Waiting for Backend to be ready..."
                            sleep 20
                            
                            # Verify backend is running
                            if ! curl -f http://localhost:3002/health; then
                                echo "Production Backend failed to start properly"
                                exit 1
                            fi
                            
                            # Start Frontend for production
                            echo "Starting Frontend for production..."
                            /usr/local/bin/docker run -d \
                                --name frontend-prod \
                                --network hd-network-prod \
                                -e VITE_API_URL=http://localhost:3002 \
                                -e VITE_WS_URL=ws://localhost:3002 \
                                -e VITE_BASE_URL=http://localhost:3002 \
                                -p 8082:80 \
                                ${APP_NAME}-frontend:${PROD_VERSION}
                            
                            # Wait for services to be ready
                            echo "Waiting for production services to be ready..."
                            sleep 30
                            
                            # Verify production services
                            if ! curl -f http://localhost:8082; then
                                echo "Production Frontend service is not accessible"
                                exit 1
                            fi
                            
                            if ! curl -f http://localhost:3002/health; then
                                echo "Production Backend service is not accessible"
                                exit 1
                            fi
                            
                            echo "Production deployment completed successfully!"
                        '''
                    } catch (Exception e) {
                        echo "Production deployment failed: ${e.message}"
                        currentBuild.result = 'FAILURE'
                        
                        // Rollback to previous version if available
                        sh '''
                            export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                            echo "Initiating rollback..."
                            /usr/local/bin/docker stop frontend-prod backend-prod postgres-prod || true
                            /usr/local/bin/docker rm frontend-prod backend-prod postgres-prod || true
                        '''
                        throw e
                    }
                }
            }
            post {
                always {
                    // Archive production deployment logs
                    sh '''
                        export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                        echo "=== Production Frontend Logs ===" > production-logs.txt
                        /usr/local/bin/docker logs frontend-prod >> production-logs.txt
                        echo -e "\n=== Production Backend Logs ===" >> production-logs.txt
                        /usr/local/bin/docker logs backend-prod >> production-logs.txt
                        echo -e "\n=== Production PostgreSQL Logs ===" >> production-logs.txt
                        /usr/local/bin/docker logs postgres-prod >> production-logs.txt
                    '''
                    archiveArtifacts artifacts: 'production-logs.txt', allowEmptyArchive: true
                }
                failure {
                    // Cleanup on failure
                    sh '''
                        export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                        /usr/local/bin/docker stop frontend-prod backend-prod postgres-prod || true
                        /usr/local/bin/docker rm frontend-prod backend-prod postgres-prod || true
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