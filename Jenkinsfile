node{
    def app
    stage('Clone') {
        checkout scm
    }

    

    stage('deploy_wikijs'){

        sh 'sudo docker-compose up -d --build'
        }
}
