const inquirer = require('inquirer');
const fetch = require("node-fetch");

const getFiles = async () => {
    let grabbedFiles = new Map()

    let downloadFiles = await fetch("https://api.github.com/repos/github/gitignore/contents/").then(data => data.json()).then((data) => {
        data.map((file) => {
            if(file.name.indexOf(".gitignore") > -1){
                grabbedFiles.set(file.name, file.download_url)
            }
        })
    })

    return grabbedFiles

}

const downloadFile = async (url) => {
    let output;

    await fetch(url).then(data => data.text()).then((data) => {
        output = data;
    }).catch((error) => console.log(error))

    return output
}


let questions = [
    {
        type: 'input',
        name: 'gitignore',
        message: 'What file do you want to download?',
        default: 'Node.gitignore'
    }
];
  
inquirer.prompt(questions).then(answers => {
    getFiles().then((grabbedFiles) => {
        downloadFile(grabbedFiles.get(answers.gitignore)).then((data) => {
            console.log(data)
        })
    })
});