pipeline {
    agent any

    environment {
        // Docker Configuration
        DOCKER_IMAGE_FRONTEND = 'bhanureddy1973/todo-app-frontend'
        DOCKER_IMAGE_BACKEND = 'bhanureddy1973/todo-app-backend'
        DOCKER_IMAGE_MONGO = 'mongo'
        DOCKER_COMPOSE_PATH = 'C:\\Program Files\\Docker\\Docker\\resources\\bin\\compose-bridge.exe'
    }

    stages {
        // Stage 1: Checkout Code with Retry
        stage('Checkout') {
            steps {
                deleteDir()
                retry(5) {
                    timeout(time: 5, unit: 'MINUTES') {
                        git branch: 'main',
                            url: 'https://github.com/bhanreddy1973/Todo-Web.git'
                    }
                }
            }
        }

        // Stage 2: Build Docker Images
        stage('Build') {
            steps {
                bat """
                @echo off
                call "%DOCKER_COMPOSE_PATH%" build
                """
            }
        }

        // Stage 3: Testing with jQuery and Code Analysis
        stage('Testing') {
            steps {
                bat """
                @echo off
                npm install jquery eslint --save-dev
                node_modules/.bin/eslint src/ --fix || true
                """
            }
        }

        // Stage 4: Docker Push
        stage('Docker Push') {
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        bat """
                        echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
                        docker tag ${DOCKER_IMAGE_FRONTEND} ${DOCKER_IMAGE_FRONTEND}:latest
                        docker tag ${DOCKER_IMAGE_BACKEND} ${DOCKER_IMAGE_BACKEND}:latest
                        docker push ${DOCKER_IMAGE_FRONTEND}:latest
                        docker push ${DOCKER_IMAGE_BACKEND}:latest
                        docker logout
                        """
                    }
                }
            }
        }

        // Stage 5: Deployment
        stage('Deploy') {
            steps {
                script {
                    bat """
                    @echo off
                    call "%DOCKER_COMPOSE_PATH%" down || true
                    call "%DOCKER_COMPOSE_PATH%" up -d
                    """
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed. Access application at http://localhost:8083'
        }
        cleanup {
            script {
                bat """
                @echo off
                call "%DOCKER_COMPOSE_PATH%" down || true
                """
            }
        }
    }
}
