node{
    def app
    stage('Clone') {
        checkout scm
    }

    

    stage('deploy_wikijs'){

        sh 'docker-compose up -d --build'
        }
}
