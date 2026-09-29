const zmq = require('zeromq/v5-compat')
const server = zmq.socket('rep')
server.bind('tcp://*:60400', err =>{
    if (err) console.log(err)
    else console.log('Готов к игре...')
})
let guess = 0
let max = 0
let min = 0
function getRange(message){
    const index = message.range.indexOf("-")
    max = Number(message.range.slice(index + 1))
    min = Number(message.range.slice(0, index))
}
function sleep(ms){
    return new Promise(resolve =>{setTimeout(resolve, ms)})
}
async function newGuess() {
    if (min > max) {
        return server.send(JSON.stringify({ error: 'range exhausted' }))
    }
    await sleep(1000)
    guess = Math.floor(Math.random() * (max - min + 1)) + min
    server.send(JSON.stringify({ answer: guess }))
    console.log(`Сервер называет число ${guess}`)
}
async function guessNum(){
    await newGuess()
}
async function hintMore(){
    min = guess + 1
    await newGuess()
}
async function hintLess(){
    max = guess - 1          
    await newGuess()
}

server.on('message', async data =>{
    const message = JSON.parse(data.toString())
    if(message.range){
        getRange(message)
            return guessNum()
    }
    switch (message.hint) {
        case 'more': return hintMore()
        case 'less': return hintLess()

    }
})