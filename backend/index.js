const express = require('express')
const cors = require('cors')
const https = require('https');
const fs = require('fs')
const path = require("path");

const app = express()
const port = 3000
const httpsOptions = {
    key: fs.readFileSync('./cert.key'),
    cert: fs.readFileSync('./key.crt')
};

//app.use(express.static(path.join(__dirname, "..", "build")));
app.use(express.static("build"));

app.use(cors());
https.createServer(httpsOptions, app).listen(port);

app.get('/get', async (req, res) => {
    //how many results requested in url? &count=X
    if (req.query.count && req.query.count > 1) {
        if (req.query.count > 20) req.query.count = 20 //max 20
    } else {
        req.query.count = 1
    }
    let arrayResult = []
    for (let i = 0; i < req.query.count; i++) {
        let adverb = await getAdverb()
        let adjective = await getAdjective()
        let noun = await getNoun()
        //if noun is femine, adj should be femine
        if (noun.gender == "f") {
            adjective = adjective.slice(0, -1) + "a"
        }
        let result = [adverb.replaceAll("_", " "), adjective.replaceAll("_", " "), noun.noun.replaceAll("_", " ")]
        result = result.join(" ")
        // use custom separator if specified in query url: /?separator=;
        req.query.separator ? result = result.replaceAll(" ", req.query.separator) : null
        arrayResult.push(result)
    }

    res.json(arrayResult)
})

async function getAdjective() {
    const page = await fetch("https://pl.wiktionary.org/wiki/Special:RandomInCategory?wpcategory=Kategoria%3AJęzyk_polski_-_przymiotniki")
    const params = page.url.split("?")[1]
    const adjective = new URLSearchParams(params).get("title")
    return adjective
}

async function getAdverb() {
    const page = await fetch("https://pl.wiktionary.org/wiki/Special:RandomInCategory?wpcategory=Kategoria%3AJęzyk_polski_-_przysłówki")
    const params = page.url.split("?")[1]
    const adverb = new URLSearchParams(params).get("title")
    return adverb
}

async function getNoun() {
    const genders = ["m", "f"]
    const gender = genders[Math.floor(Math.random() * genders.length)];
    let page
    switch (gender) {
        case "m":
            page = await fetch("https://pl.wiktionary.org/wiki/Special:RandomInCategory?wpcategory=Kategoria%3AJęzyk_polski_-_rzeczowniki_rodzaju_męskozwierzęcego")
            break;
        case "f":
            page = await fetch("https://pl.wiktionary.org/wiki/Special:RandomInCategory?wpcategory=Kategoria%3AJęzyk_polski_-_rzeczowniki_rodzaju_żeńskiego")
            break;
    }
    const params = page.url.split("?")[1]
    const noun = new URLSearchParams(params).get("title")
    return { noun: noun, gender: gender }
}