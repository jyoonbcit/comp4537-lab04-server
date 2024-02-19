const http = require('http');
const url = require('url');
const message = require("./user.js");

let dictionary = [];
let requestCount = 0;

http.createServer((req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/html, text/plain",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST"
    })
    requestCount++;
    if (req.method === "GET") {
        let q = url.parse(req.url, true);
        if (q.query.word) {
            let word = q.query.word;
            if (dictionary.length === 0) {
                res.end(message.dictionaryEmptyError);
            } else {
                dictionary.forEach(entry => {
                    let wordKey = entry.split(":")[0];
                    if (wordKey === word) {
                        res.end(entry);
                    } else {
                        res.end(message.searchError);
                    }
                });
            }
        }
    } else if (req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk;
        });
        req.on("end", () => {
            let params = new URLSearchParams(body);
            let word = params.get("word");
            let definition = params.get("definition");
            // If dictionary is empty, add word
            if (dictionary.length === 0) {
                dictionary.push(`${word}: ${definition}`);
                res.end(`${word}: ${definition}`);
            } else {
                // If dictionary is not empty, check if word exists
                let wordExists = false;
                dictionary.forEach(entry => {
                    console.log(entry);
                    let wordKey = entry.split(":")[0];
                    console.log(wordKey);
                    if (wordKey === word) {
                        wordExists = true;
                        return;
                    }
                });
                if (wordExists) {
                    // If word exists, inform user
                    res.end(message.warning.replace("%s", word));
                } else {
                    // If word does not exist, add word
                    dictionary.push(`${word}:${definition}`);
                    res.end(`${message.count.replace("%s", requestCount)}${message.success.replace("%s", word).replace("%t", definition)}`);
                }
            }
        });
    }
}).listen(8000);
