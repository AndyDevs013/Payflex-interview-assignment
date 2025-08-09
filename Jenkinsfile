pipeline {
  agent { docker { image 'cypress/included:13.6.2' } }

  stages {
    stage('Test') {
      when { branch 'Adding-jenkins-setup' }
      steps {
        dir('cypress') {
          sh 'npm ci'
          sh 'npm test --silent'
        }
      }
    }
  }
}


