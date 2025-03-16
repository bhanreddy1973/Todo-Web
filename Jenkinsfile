pipeline {
    agent any

    environment {
        // Docker Configuration
        DOCKER_IMAGE_FRONTEND = 'bhanureddy1973/todo-app-frontend'
        DOCKER_IMAGE_BACKEND = 'bhanureddy1973/todo-app-backend'
        DOCKER_IMAGE_MONGO = 'mongo'
        // Path to compose-bridge.exe (using short path if needed)
        DOCKER_COMPOSE_PATH = 'C:\\Program Files\\Docker\\Docker\\resources\\bin\\compose-bridge.exe'
    }

    stages {
        // Stage 1: Checkout Code with Retry
        stage('Checkout') {
            steps {
                cleanWs()
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: 'main']],
                    extensions: [[$class: 'CleanBeforeCheckout']],
                    userRemoteConfigs: [[url: 'https://github.com/bhanreddy1973/Todo-Web.git']]
                ])
            }
        }

        // Stage 2: Build Docker Images
        stage('Build') {
            steps {
                // Use bat for Windows compatibility
                bat """
                @echo off
                echo Building Docker images...
                call "%DOCKER_COMPOSE_PATH%" build || exit /b 1
                """
            }
        }
        
        // Stage 3: Testing - Frontend
        stage('Testing Frontend') {
            steps {
                dir('web-service') {
                    bat """
                    @echo off
                    echo Running npm install in web-service
                    npm install || exit /b 1
                    echo Running tests in web-service
                    npm test || exit /b 1
                    """
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'web-service/junit.xml'
                }
            }
        }

        // Stage 4: Testing - Backend
        stage('Testing Backend') {
            steps {
                dir('worker-service') {
                    bat """
                    @echo off
                    echo Running npm install in worker-service
                    npm install || exit /b 1
                    echo Running tests in worker-service
                    npm test || exit /b 1
                    """
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'worker-service/junit.xml'
                }
            }
        }

        // Stage 5: Docker Push
        stage('Docker Push') {
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        bat """
                        @echo off
                        echo Logging in to Docker Hub...
                        echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin || exit /b 1
                        echo Tagging and pushing images...
                        docker tag ${DOCKER_IMAGE_FRONTEND} ${DOCKER_IMAGE_FRONTEND}:latest || exit /b 1
                        docker tag ${DOCKER_IMAGE_BACKEND} ${DOCKER_IMAGE_BACKEND}:latest || exit /b 1
                        docker push ${DOCKER_IMAGE_FRONTEND}:latest || exit /b 1
                        docker push ${DOCKER_IMAGE_BACKEND}:latest || exit /b 1
                        docker logout
                        """
                    }
                }
            }
        }

        // Stage 6: Deployment
        stage('Deploy') {
            steps {
                script {
                    // Cleanup previous deployment and start fresh environment
                    bat """
                    @echo off
                    echo Stopping previous deployment...
                    call "%DOCKER_COMPOSE_PATH%" down || true
                    echo Starting new deployment...
                    call "%DOCKER_COMPOSE_PATH%" up -d || exit /b 1
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully. Access application at http://localhost:8083'
        }
        failure {
            echo 'Pipeline failed. Please check the logs for details.'
        }
        cleanup {
            script {
                bat """
                @echo off
                echo Cleaning up Docker resources...
                call "%DOCKER_COMPOSE_PATH%" down || true
                """
            }
        }
    }
}