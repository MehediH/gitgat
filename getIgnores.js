const storage = require('node-persist');
const fetch = require("node-fetch");

const getFreshData = async () => {
    let grabbedFiles = {}
    
    await fetch("https://api.github.com/repos/github/gitignore/contents/").then(data => data.json()).then((data) => {
        data.map((file) => {
            if(file.name.indexOf(".gitignore") > -1){
                grabbedFiles[file.name] = file.download_url
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

const getIgnores = async () => {
    await storage.init()    

    let data = await storage.getItem('gitIgnores');

    if(data === undefined){
        let files = await getFreshData().then((data) => {
            return data
        })

        await storage.setItem("gitIgnores", files)
    }

    return await storage.getItem('gitIgnores')
}

module.exports = getIgnores;