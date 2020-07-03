generateMessage = (username,text) => {
    return {
        text,
        time:new Date().getTime(),
        username
    }
}

generateLocationMessage = (username,url) => {
    return {
        url,
        time:new Date().getTime(),
        username
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}