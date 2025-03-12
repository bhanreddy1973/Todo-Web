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
        // Stage 1: Checkout Code
        stage('Checkout') {
            steps {
                deleteDir()
                git branch: 'main', url: 'https://github.com/bhanreddy1973/Todo-Web.git'
            }
        }

        // Stage 2: Build & Deploy Docker Images
        stage('Build & Deploy') {
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
            echo 'Pipeline completed. Access application at http://localhost:3000'
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
