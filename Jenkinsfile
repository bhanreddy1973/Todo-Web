pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM',
                          branches: [[name: '*/main']], // Change to your branch name if needed
                          userRemoteConfigs: [[url: 'https://github.com/bhanreddy1973/Todo-Web.git',
                                               credentialsId: 'github-credentials']], // Use your credentials ID here
                          extensions: [[$class: 'RelativeTargetDirectory', relativeTargetDir: 'Todo-Web']]
                ])
            }
        }
        stage('Build') {
            steps {
                echo 'Building...'
                // Add your build steps here
            }
        }
    }
}
