pipeline {
    agent any
    
    environment {
        // SonarQube Configuration
        SONARQUBE_SERVER = 'SonarQube'
        
        // Docker Configuration
        DOCKER_IMAGE_FRONTEND = 'bhanureddy1973/todo-app-frontend'
        DOCKER_IMAGE_BACKEND = 'bhanureddy1973/todo-app-backend'
        DOCKER_IMAGE_MONGO = 'mongo'
        
        // Node.js Version
        NODE_VERSION = '18.x'
    }
    
    stages {
        // Stage 1: Checkout Code
        stage('Checkout') {
            steps {
                deleteDir()
                git branch: 'main', url: 'https://github.com/bhanreddy1973/Todo-Web.git'
            }
        }

        // Stage 2: Install Dependencies & Test
        stage('Build & Test') {
            parallel {
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'nvm install ${NODE_VERSION} && npm ci'
                            sh 'npm run test -- --watchAll=false'
                        }
                    }
                }
                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh 'nvm install ${NODE_VERSION} && npm ci'
                            sh 'npm test'
                        }
                    }
                }
            }
        }

        // Stage 3: SonarQube Analysis
        stage('Code Quality Check') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    script {
                        // For ReactJS (JavaScript/TypeScript)
                        dir('frontend') {
                            sh '''
                            sonar-scanner \
                            -Dsonar.projectKey=todo-web \
                            -Dsonar.host.url=http://localhost:9000 \
                            -Dsonar.login=squ_b0c4b672e840ebe2d14a74558207d673deda73ac \
                            -Dsonar.sources=src \
                            -Dsonar.tests=src \
                            -Dsonar.test.inclusions=**/*.test.js
                            '''
                        }
                        
                        // For Node.js (JavaScript)
                        dir('backend') {
                            sh '''
                            sonar-scanner \
                            -Dsonar.projectKey=todo-api \
                            -Dsonar.host.url=http://localhost:9000 \
                            -Dsonar.login=squ_b0c4b672e840ebe2d14a74558207d673deda73ac \
                            -Dsonar.sources=src \
                            -Dsonar.tests=test
                            '''
                        }
                    }
                }
            }
        }

        // Stage 4: Docker Build
        stage('Docker Build') {
            parallel {
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh "docker build -t ${DOCKER_IMAGE_FRONTEND} ."
                        }
                    }
                }
                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh "docker build -t ${DOCKER_IMAGE_BACKEND} ."
                        }
                    }
                }
            }
        }

        // Stage 5: Docker Push
        stage('Docker Push') {
            steps {
                script {
                    // Use Jenkins Credentials Store instead of plain text
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"
                        sh "docker push ${DOCKER_IMAGE_FRONTEND}"
                        sh "docker push ${DOCKER_IMAGE_BACKEND}"
                    }
                }
            }
        }

        // Stage 6: Deployment
        stage('Deploy') {
            steps {
                script {
                    // Create Docker Network
                    sh 'docker network create todo-net || true'
                    
                    // MongoDB
                    sh "docker run -d --name mongodb --network todo-net \
                        -v mongo_data:/data/db \
                        ${DOCKER_IMAGE_MONGO}"
                    
                    // Backend Service
                    sh "docker run -d --name backend --network todo-net \
                        -p 5000:5000 \
                        -e MONGO_URI=mongodb://mongodb:27017/todo \
                        ${DOCKER_IMAGE_BACKEND}"
                    
                    // Frontend Service
                    sh "docker run -d --name frontend --network todo-net \
                        -p 3000:3000 \
                        -e REACT_APP_API_URL=http://localhost:5000 \
                        ${DOCKER_IMAGE_FRONTEND}"
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed. Access application at http://localhost:3000'
        }
        cleanup {
            // Cleanup Docker containers on failure
            script {
                sh 'docker stop frontend backend mongodb || true'
                sh 'docker rm frontend backend mongodb || true'
            }
        }
    }
}
