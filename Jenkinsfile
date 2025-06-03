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
        stage('Monitoring Setup') {
            steps {
                script {
                    try {
                        sh '''
                            export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                            
                            # Clean up existing containers if they exist
                            /usr/local/bin/docker rm -f prometheus grafana || true
                            
                            # Create monitoring network if it doesn't exist
                            /usr/local/bin/docker network create monitoring || true
                            
                            # Create Docker volumes for Prometheus and Grafana
                            /usr/local/bin/docker volume create prometheus-config
                            /usr/local/bin/docker volume create grafana-storage
                            
                            # Create initial configuration files using a temporary container
                            /usr/local/bin/docker run --rm -v prometheus-config:/config alpine sh -c "mkdir -p /config && touch /config/prometheus.yml /config/alert.rules"
                            
                            # Copy configuration files to the volume
                            cat prometheus.yml | /usr/local/bin/docker run --rm -i -v prometheus-config:/config alpine sh -c "cat > /config/prometheus.yml"
                            cat alert.rules | /usr/local/bin/docker run --rm -i -v prometheus-config:/config alpine sh -c "cat > /config/alert.rules"
                            
                            # Start Prometheus
                            echo "Starting Prometheus..."
                            /usr/local/bin/docker run -d \
                                --name prometheus \
                                --network monitoring \
                                --network hd-network \
                                -p 9090:9090 \
                                -v prometheus-config:/etc/prometheus \
                                prom/prometheus
                            
                            # Start Grafana
                            echo "Starting Grafana..."
                            /usr/local/bin/docker run -d \
                                --name grafana \
                                --network monitoring \
                                --network hd-network \
                                -p 3000:3000 \
                                -v grafana-storage:/var/lib/grafana \
                                grafana/grafana
                            
                            # Wait for services to be ready
                            echo "Waiting for monitoring services to be ready..."
                            sleep 10
                            
                            # Configure Grafana datasource
                            curl -X POST http://localhost:3000/api/datasources \
                                -H "Content-Type: application/json" \
                                -d '{
                                    "name": "Prometheus",
                                    "type": "prometheus",
                                    "url": "http://prometheus:9090",
                                    "access": "proxy",
                                    "isDefault": true
                                }'
                            
                            echo "Monitoring setup completed successfully!"
                        '''
                    } catch (Exception e) {
                        echo "Monitoring setup failed: ${e.message}"
                        currentBuild.result = 'FAILURE'
                        throw e
                    }
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