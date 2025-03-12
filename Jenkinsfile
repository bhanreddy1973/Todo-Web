pipeline {
    agent any

    environment {
        // Docker Configuration
        DOCKER_IMAGE_FRONTEND = 'bhanureddy1973/todo-app-frontend'
        DOCKER_IMAGE_BACKEND = 'bhanureddy1973/todo-app-backend'
        DOCKER_IMAGE_MONGO = 'mongo'
    }

    stages {
        // Stage 1: Checkout Code
        stage('Checkout') {
            steps {
                deleteDir()
                git branch: 'main', url: 'https://github.com/bhanreddy1973/Todo-Web.git'
            }
        }

        // Stage 2: Build Docker Images
        stage('Build') {
            steps {
                sh 'docker-compose build'
            }
        }

        // Stage 3: Docker Push
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
                        docker logout
                        """
                    }
                }
            }
        }

        // Stage 4: Deployment
        stage('Deploy') {
            steps {
                script {
                    // Cleanup previous deployment
                    sh 'docker-compose down || true'
                    
                    // Create fresh environment
                    sh 'docker-compose up -d'
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed. Access application at http://localhost:8083'
        }
        cleanup {
            // Cleanup Docker containers on failure
            script {
                sh 'docker-compose down || true'
            }
        }
    }
}
