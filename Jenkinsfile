pipeline {
    agent any
    
    environment {
        APP_NAME = 'hd-project'
        VERSION = "${BUILD_NUMBER}"
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
                    archiveArtifacts artifacts: '**/npm-audit-*.json,**/package-lock.json', allowEmptyArchive: true
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
                            sh '''
                                export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
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
                                sleep 30
                                
                                # Check backend logs
                                echo "Backend container logs:"
                                /usr/local/bin/docker logs backend
                                
                                # Verify backend is running
                                echo "Checking backend health endpoint..."
                                for i in {1..5}; do
                                    if curl -f http://localhost:3001/health; then
                                        echo "Backend is healthy!"
                                        break
                                    fi
                                    echo "Attempt $i: Backend not ready yet, waiting..."
                                    sleep 10
                                done
                                
                                # Final health check
                                if ! curl -f http://localhost:3001/health; then
                                    echo "Backend failed to start properly after all attempts"
                                    echo "Container logs:"
                                    /usr/local/bin/docker logs backend
                                    exit 1
                                fi
                            '''
                            
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