pipeline {
    agent any
    
    environment {
        // Docker Configuration
        DOCKER_IMAGE_FRONTEND = 'bhanureddy1973/todo-app-frontend'
        DOCKER_IMAGE_BACKEND = 'bhanureddy1973/todo-app-backend'
        DOCKER_IMAGE_MONGO = 'mongo'
        
        // Path to compose-bridge.exe (using short path if needed)
        DOCKER_COMPOSE_PATH = 'C:\\Program Files\\Docker\\Docker\\resources\\bin\\compose-bridge.exe'
        
        // SonarQube configuration
        SONAR_SCANNER_OPTS = '-Dsonar.host.url=http://localhost:9000'
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
        
        // Stage 2: Frontend Testing and Coverage
        stage('Frontend Test') {
            steps {
                dir('web-service') {
                    bat '''
                        @echo off
                        echo Running npm install in web-service
                        npm install || exit /b 1
                        echo Running tests with coverage in web-service
                        npm test || exit /b 1
                    '''
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'web-service/junit.xml'
                }
            }
        }
        
        // Stage 3: Backend Testing and Coverage
        stage('Backend Test') {
            steps {
                dir('worker-service') {
                    bat '''
                        @echo off
                        echo Running npm install in worker-service
                        npm install || exit /b 1
                        echo Running tests with coverage in worker-service
                        npm test || exit /b 1
                    '''
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'worker-service/junit.xml'
                }
            }
        }
        
        // Stage 4: SonarQube Analysis
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    bat '''
                        @echo off
                        echo Running SonarQube analysis for frontend...
                        cd web-service
                        sonar-scanner || exit /b 1
                        
                        echo Running SonarQube analysis for backend...
                        cd ../worker-service
                        sonar-scanner || exit /b 1
                    '''
                }
            }
        }
        
        // Stage 5: Quality Gate
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        
        // Stage 6: Build Docker Images
        stage('Build') {
            steps {
                bat '''
                    @echo off
                    echo Building Docker images...
                    call "%DOCKER_COMPOSE_PATH%" build || exit /b 1
                '''
            }
        }
        
        // Stage 7: Docker Push with fixed credential variables
        stage('Docker Push') {
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        bat '''
                            @echo off
                            echo Logging in to Docker Hub...
                            :: Create a temporary file with the password
                            echo %DOCKER_PASS% > docker_password.txt
                            
                            :: Use the file for non-interactive login
                            type docker_password.txt | docker login -u %DOCKER_USER% --password-stdin
                            
                            :: Remove the temporary file immediately
                            del docker_password.txt
                            
                            echo Tagging images...
                            docker tag %DOCKER_IMAGE_FRONTEND% %DOCKER_IMAGE_FRONTEND%:latest
                            docker tag %DOCKER_IMAGE_BACKEND% %DOCKER_IMAGE_BACKEND%:latest
                            
                            echo Pushing images to Docker Hub...
                            docker push %DOCKER_IMAGE_FRONTEND%:latest
                            docker push %DOCKER_IMAGE_BACKEND%:latest
                            
                            echo Logging out from Docker Hub...
                            docker logout
                        '''
                    }
                }
            }
        }
        
        // Stage 8: Deployment
        stage('Deploy') {
            steps {
                script {
                    bat '''
                        @echo off
                        echo Stopping previous deployment...
                        call "%DOCKER_COMPOSE_PATH%" down || true
                        echo Starting new deployment...
                        call "%DOCKER_COMPOSE_PATH%" up -d || exit /b 1
                    '''
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
                bat '''
                    @echo off
                    echo Cleaning up Docker resources...
                    call "%DOCKER_COMPOSE_PATH%" down || true
                '''
            }
        }
    }
}