pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                script {
                    // Install dependencies
                    sh 'npm install'
                }
            }
        }
        stage('Test') {
            steps {
                script {
                    // Run tests
                    sh 'npm test'
                }
            }
        }
        stage('Deploy') {
            steps {
                script {
                    // Deploy the application (this can vary based on your deployment strategy)
                    sh 'npm run deploy'
                }
            }
        }
    }
}