def agentLabel = ""
pipeline{
    agent any
    options {
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '10'))
    }
    parameters {
        string(name: 'testsToRun',description: '' )
        string(name: 'runnerJarPath', defaultValue: 'C:\\dev\\shift\\silk-central-shift\\execution-wrapper\\target\\octane-shift-execution-wrapper-4.20-SNAPSHOT.jar', description: "")
        string(name: 'nunit2',defaultValue: '\"D:\\from C\\myFolder\\nunit\\NUnit-2.7.1\\bin\\nunit-console.exe\"',description: '' )
        string(name: 'nunit3',defaultValue: '\"D:\\from C\\myFolder\\netcoreapp3.1\\Nunit\\nunit3-console.exe\"' )
        string(name: 'suiteId',description: '' )
        string(name: 'suiteRunId',description: '' )
    }
    environment {
            AUTH_TOKEN = credentials('AndreiGithubCredentials')
    }
    stages {

        stage('setTag') {
            steps {
                script {
                    agentLabel = bat(script: "echo myTag1", returnStdout: true).trim().readLines().drop(1).join(" ")
                }
            }
        }

        stage('Run Tests') {
            agent{
                label agentLabel
            }
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'AndreiSVN', usernameVariable: 'github_user', passwordVariable: 'github_password')]) {
                        sh 'echo START'
                        sh 'cd runner-script'
                        sh 'call npm install'
                        sh 'call npm run build'
                        sh 'call npm run start-nunit "${params.testsToRunConverted}" "${params.runnerJarPath}" "${params.nunit2}" "${params.nunit3}" ${suiteId} ${suiteRunId} $github_user $github_password'
                        sh 'call command_to_execute.bat'
                        sh 'call java_command_to_execute.bat'
                    }
                }
            }

        }
        
    }
    post {
            failure {
                cleanWs()
            }
            success {
                archiveArtifacts artifacts: 'runner-script/java_command_to_execute.bat,runner-script/command_to_execute.bat,runner-script/testResults/*xml', onlyIfSuccessful: true
                junit allowEmptyResults: true, testResults: 'runner-script/testResults/*xml'
                cleanWs()
            }
            aborted {
                cleanWs()
            }
        }

}
