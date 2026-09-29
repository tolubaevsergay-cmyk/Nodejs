const zmq = require('zeromq/v5-compat')
const client = zmq.socket('req')

client.connect('tcp://localhost:60400', ()=>{
    console.log('Клиент подключился')
    
})

let min = Number(process.argv[2])
let max = Number(process.argv[3])

let secret = 0
range()
makeAnswer()
function range(){
    client.send(JSON.stringify({range: `${min}-${max}`}))
}
function makeAnswer(){
    secret = Math.floor(Math.random() * (max - min + 1)) + min
    console.log(`Загадано число ${secret}`)
}

client.on('message', data =>{
    const message = JSON.parse(data)
    const guess = message.answer
    switch (true) {
    case guess < secret:
        client.send(JSON.stringify({ hint: 'more' }))
        console.log(`Число сервера ${guess} меньше, чем ${secret}`)
        break
    case guess > secret:
        client.send(JSON.stringify({ hint: 'less' }))
        console.log(`Число сервера ${guess} больше, чем ${secret}`)
        break
    case guess == secret:
        console.log('Сервер угадал число. Отлкючение клиента...')
        client.close()
        process.exit(0)
}

})

