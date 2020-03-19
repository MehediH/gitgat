const inquirer = require('inquirer');
const fetch = require("node-fetch");
const fs = require('fs');
const fuzzy = require('fuzzy');


inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));


const getFiles = async () => {
    let grabbedFiles = new Map()

    let downloadFiles = await fetch("https://api.github.com/repos/github/gitignore/contents/").then(data => data.json()).then((data) => {
        data.map((file) => {
            if(file.name.indexOf(".gitignore") > -1){
                grabbedFiles.set(file.name, file.download_url)
            }
        })
    }).catch((err) => {
        let message = err.message;

        if(message.indexOf("map is not a function") > -1 ){
            message = "GitHub API limit hit. Please try again in an hour or so. Sorry!"
        }

        console.log("🚨 Something went wrong: " + message)
        throw err
    })

    return grabbedFiles

}



const main = async () => {
    let files;

    console.log('\x1b[36m%s\x1b[0m', 'Welcome to Get Ignore. Just give it a moment to start up.\n');  

    files = await getFiles().then((data) => files = data).catch((err) => {
        return;
    })
    
    const downloadFile = async (url) => {
        let output;
    
        await fetch(url).then(data => data.text()).then((data) => {
            output = data;
        }).catch((error) => console.log(error))
    
        return output
    }

    function searchIgnores(answers, input) {
        input = input || '';
        return new Promise(function(resolve) {
          setTimeout(function() {
            var fuzzyResult = fuzzy.filter(input, Array.from(files.keys()));
            resolve(
              fuzzyResult.map(function(el) {
                return el.original;
              })
            );
          }, 200);
        });
    }
    
    let questions = [
        {
            type: 'autocomplete',
            name: 'gitignore',
            suggestOnly: false,
            message: 'What .gitignore do you want to download? Start typing to autocomplete. ',
            source: searchIgnores,
            pageSize: 15
        }, {
            type: 'confirm',
            name: 'more',
            message: 'Do you want to add contents of another .gitignore?',
            default: false
        },
    ];
      
    let requested = [];

    const getInput = async () => {
        let out;

        await inquirer.prompt(questions).then(answers => {
            requested.push(answers.gitignore)
            out = answers.more
        });

        return out
    }

    let ask = await getInput().then((res) => {return res})
    
    while(ask){
        console.log("\n")
        ask = await getInput().then((res) => {return res})
    }

    let gitIgnoreContent = "# GENERATED BY GET IGNORE\n\n\n"; 

    let downloadRequestedFiles = requested.map((item) => {
        return downloadFile(files.get(item)).then((data) => {
            gitIgnoreContent += `# GET IGNORE file for ${item}\n\n${data}\n\n`
        })
    })

    Promise.all(downloadRequestedFiles).then(() => {
        fs.writeFile(".gitignore-f", data).catch((err) => {
            console.log(err)
        })
    })

}

main()
