pipeline {
    agent any

    environment {
        // Docker Configuration
        DOCKER_IMAGE_FRONTEND = 'bhanureddy1973/todo-app-frontend'
        DOCKER_IMAGE_BACKEND = 'bhanureddy1973/todo-app-backend'
        DOCKER_IMAGE_MONGO = 'mongo'
        // Path to docker-compose.exe (using short path for robustness)
        // You MUST verify this short path on your Jenkins agent!
        DOCKER_COMPOSE_PATH = 'C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker-compose.exe'
        // SonarQube Configuration
        SONAR_HOST_URL    = "http://localhost:9000"
        SONAR_TOKEN       = "sqp_8a9277d337d6a57582b2d29490082f0578832a56" // Replace with your SonarQube token
        SONAR_SCANNER_HOME = tool 'SonarScanner' // Ensure you have SonarScanner tool configured in Jenkins
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

        // Stage 2: Install Dependencies
        stage('Install Dependencies') {
            steps {
                bat """
                @echo off
                cd web-service
                npm install
                cd ..
                cd worker-service
                npm install
                cd ..
                """
            }
        }

        // Stage 3: Run Tests
        stage('Run Tests') {
            steps {
                bat """
                @echo off
                cd web-service
                npm test
                cd ..
                cd worker-service
                npm test
                cd ..
                """
            }
        }

        // Stage 4: SonarQube Analysis
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('todo-web') { // SonarQube project key
                    bat """
                    @echo off
                    cd web-service
                    ${env.SONAR_SCANNER_HOME}/bin/sonar-scanner -Dsonar.host.url=${env.SONAR_HOST_URL} -Dsonar.login=${env.SONAR_TOKEN}
                    cd ..
                    cd worker-service
                    ${env.SONAR_SCANNER_HOME}/bin/sonar-scanner -Dsonar.host.url=${env.SONAR_HOST_URL} -Dsonar.login=${env.SONAR_TOKEN}
                    cd ..
                    """
                }
            }
        }

        // Stage 5: Build Docker Images
        stage('Build') {
            steps {
                // Use bat for Windows compatibility
                bat """
                @echo off
                call "%DOCKER_COMPOSE_PATH%" build
                """
            }
        }

        // Stage 6: Docker Push
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

        // Stage 7: Deployment
        stage('Deploy') {
            steps {
                script {
                    // Cleanup previous deployment and start fresh environment
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