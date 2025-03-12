pipeline {
    agent any

    environment {
        // SonarQube Configuration
        SONARQUBE_SERVER = 'SonarQube'
        SONARQUBE_TOKEN = credentials('sonarqube-token') // Store token in Jenkins credentials
        
        // Docker Configuration
        DOCKER_IMAGE_FRONTEND = 'bhanureddy1973/todo-app-frontend'
        DOCKER_IMAGE_BACKEND = 'bhanureddy1973/todo-app-backend'
        DOCKER_IMAGE_MONGO = 'mongo'
    }

    stages {
        // Stage 1: Checkout with retry
        stage('Checkout') {
            steps {
                deleteDir()
                retry(3) {
                    git branch: 'main', 
                         url: 'https://github.com/bhanreddy1973/Todo-Web.git'
                }
            }
        }

        // Stage 2: Build & Test with Node.js 20
        stage('Build & Test') {
            parallel {
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            nodejs(nodeJSInstallationName: 'NodeJS_20') {
                                sh 'npm ci --no-audit'
                                sh 'npm run test -- --watchAll=false --coverage'
                            }
                        }
                    }
                }
                stage('Backend') {
                    steps {
                        dir('backend') {
                            nodejs(nodeJSInstallationName: 'NodeJS_20') {
                                sh 'npm ci --no-audit'
                                sh 'npm test -- --coverage'
                            }
                        }
                    }
                }
            }
        }

        // Stage 3: SonarQube Analysis with security
        stage('Code Quality') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    script {
                        dir('frontend') {
                            sh """
                            sonar-scanner \
                            -Dsonar.projectKey=todo-web \
                            -Dsonar.host.url=http://localhost:9000 \
                            -Dsonar.login=${SONARQUBE_TOKEN} \
                            -Dsonar.sources=src \
                            -Dsonar.tests=src \
                            -Dsonar.test.inclusions=**/*.test.js \
                            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                            """
                        }
                        dir('backend') {
                            sh """
                            sonar-scanner \
                            -Dsonar.projectKey=todo-api \
                            -Dsonar.host.url=http://localhost:9000 \
                            -Dsonar.login=${SONARQUBE_TOKEN} \
                            -Dsonar.sources=src \
                            -Dsonar.tests=test \
                            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                            """
                        }
                    }
                }
            }
        }

        // Stage 4: Docker Build with cache
        stage('Docker Build') {
            parallel {
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh "docker build --pull --cache-from ${DOCKER_IMAGE_FRONTEND} -t ${DOCKER_IMAGE_FRONTEND} ."
                        }
                    }
                }
                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh "docker build --pull --cache-from ${DOCKER_IMAGE_BACKEND} -t ${DOCKER_IMAGE_BACKEND} ."
                        }
                    }
                }
            }
        }

        // Stage 5: Secure Docker Push
        stage('Docker Push') {
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh """
                        echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin
                        docker push ${DOCKER_IMAGE_FRONTEND}
                        docker push ${DOCKER_IMAGE_BACKEND}
                        """
                    }
                }
            }
        }

        // Stage 6: Safe Deployment
        stage('Deploy') {
            steps {
                script {
                    // Cleanup previous deployment
                    sh 'docker stop frontend backend mongodb || true'
                    sh 'docker rm frontend backend mongodb || true'
                    sh 'docker network rm todo-net || true'
                    
                    // Create fresh environment
                    sh 'docker network create todo-net'
                    sh """
                    docker run -d --name mongodb --network todo-net \
                        -v mongo_data:/data/db \
                        --restart unless-stopped \
                        ${DOCKER_IMAGE_MONGO}
                    """
                    sh """
                    docker run -d --name backend --network todo-net \
                        -p 5000:5000 \
                        -e MONGO_URI=mongodb://mongodb:27017/todo \
                        --restart unless-stopped \
                        ${DOCKER_IMAGE_BACKEND}
                    """
                    sh """
                    docker run -d --name frontend --network todo-net \
                        -p 3000:3000 \
                        -e REACT_APP_API_URL=http://backend:5000 \
                        --restart unless-stopped \
                        ${DOCKER_IMAGE_FRONTEND}
                    """
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed. Access: http://localhost:3000'
            junit '**/test-results.xml' // Add test reporting
            cobertura autoUpdateHistory: true, coberturaReportFile: '**/coverage/cobertura-coverage.xml'
        }
        failure {
            emailext body: 'Pipeline failed: ${BUILD_URL}', subject: 'Pipeline Failed: ${JOB_NAME}', to: 'team@example.com'
        }
    }
}
