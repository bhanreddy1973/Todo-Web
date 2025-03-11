pipeline {
    agent any

    environment {
        SONARQUBE_SERVER = 'SonarQube' // Name of the SonarQube server in Jenkins
        DOCKER_IMAGE_WEB = 'bhanureddy1973/todo-app-web-service'
        DOCKER_IMAGE_WORKER = 'bhanureddy1973/todo-app-worker-service'
        DOCKER_IMAGE_MONGO = 'mongo'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/bhanureddy1973/Todo-Web.git' // Replace with your actual repo
            }
        }

        stage('Build & Test') {
            steps {
                script {
                    sh 'mvn clean install' // Adjust if using a different build tool
                }
            }
        }

    stage('SonarQube Analysis') {
    steps {
        withSonarQubeEnv('SonarQube') { // Ensure 'SonarQube' matches the name configured in Jenkins
            sh '''
                mvn clean verify sonar:sonar \
                    -Dsonar.projectKey=todo-web \
                    -Dsonar.host.url=http://localhost:9000 \
                    -Dsonar.login=squ_b0c4b672e840ebe2d14a74558207d673deda73ac
            '''
        }
    }
}


        stage('Docker Build') {
            parallel {
                stage('Build Web Service') {
                    steps {
                        script {
                            sh 'docker build -t $DOCKER_IMAGE_WEB ./path-to-web-service'
                        }
                    }
                }
                stage('Build Worker Service') {
                    steps {
                        script {
                            sh 'docker build -t $DOCKER_IMAGE_WORKER ./path-to-worker-service'
                        }
                    }
                }
            }
        }

        stage('Docker Push') {
            parallel {
                stage('Push Web Service Image') {
                    steps {
                        script {
                            sh 'docker login -u bhanureddy1973 -p bhanu1973'
                            sh 'docker push $DOCKER_IMAGE_WEB'
                        }
                    }
                }
                stage('Push Worker Service Image') {
                    steps {
                        script {
                            sh 'docker login -u bhanureddy1973 -p bhanu1973'
                            sh 'docker push $DOCKER_IMAGE_WORKER'
                        }
                    }
                }
            }
        }

        stage('Deploy Containers') {
            parallel {
                stage('Deploy MongoDB') {
                    steps {
                        script {
                            sh 'docker run -d --name mongodb -p 27017:27017 $DOCKER_IMAGE_MONGO'
                        }
                    }
                }
                stage('Deploy Web Service') {
                    steps {
                        script {
                            sh 'docker run -d --name web-service-container --link mongodb:mongodb -p 3000:3000 $DOCKER_IMAGE_WEB'
                        }
                    }
                }
                stage('Deploy Worker Service') {
                    steps {
                        script {
                            sh 'docker run -d --name worker-service-container --link mongodb:mongodb $DOCKER_IMAGE_WORKER'
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed.'
        }
    }
}
