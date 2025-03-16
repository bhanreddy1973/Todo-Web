pipeline {
    agent any

    environment {
        // Docker Configuration
        DOCKER_IMAGE_FRONTEND = 'bhanureddy1973/todo-app-frontend'
        DOCKER_IMAGE_BACKEND = 'bhanureddy1973/todo-app-backend'
        DOCKER_IMAGE_MONGO = 'mongo'
        DOCKER_COMPOSE_CMD = 'docker compose'
    }

    stages {
        // Stage 1: Checkout Code
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

        // Stage 2: Install Dependencies
        stage('Install Dependencies') {
            steps {
                bat """
                npm install jquery
                """
            }
        }

        // Stage 3: Build Docker Images
        stage('Build') {
            steps {
                bat """
                ${DOCKER_COMPOSE_CMD} build
                """
            }
        }

        // Stage 4: Run Code Analysis with jQuery
        stage('Code Analysis') {
            steps {
                bat """
                node_modules/.bin/jquery --analyze src/
                """
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
                ${DOCKER_COMPOSE_CMD} down --remove-orphans || true
                ${DOCKER_COMPOSE_CMD} up -d
                """
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed. Access application at http://localhost:8083'
        }
        cleanup {
            bat "${DOCKER_COMPOSE_CMD} down"
        }
    }
}
