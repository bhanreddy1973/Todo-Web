pipeline {
    agent any

    environment {
        // Docker Configuration
        DOCKER_IMAGE_FRONTEND = 'bhanureddy1973/todo-app-frontend'
        DOCKER_IMAGE_BACKEND = 'bhanureddy1973/todo-app-backend'
        DOCKER_IMAGE_MONGO = 'mongo'
        DOCKER_COMPOSE_PATH = 'docker-compose'
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
                ${DOCKER_COMPOSE_PATH} build --no-cache
                """
            }
        }

        // Stage 3: Testing - Frontend
        stage('Testing Frontend') {
            steps {
                dir('web-service') {
                    bat 'npm install'
                    bat 'npm run test'
                }
            }
            post {
                always {
                    junit 'web-service/junit.xml'
                }
            }
        }

        // Stage 4: Testing - Backend
        stage('Testing Backend') {
            steps {
                dir('worker-service') {
                    bat 'npm install'
                    bat 'npm run test'
                }
            }
            post {
                always {
                    junit 'worker-service/junit.xml'
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

        // Stage 6: Deployment
        stage('Deploy') {
            steps {
                bat """
                ${DOCKER_COMPOSE_PATH} down || true
                ${DOCKER_COMPOSE_PATH} up -d
                """
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed. Access application at http://localhost:8083'
        }
        cleanup {
            bat """
            ${DOCKER_COMPOSE_PATH} down || true
            """
        }
    }
}
