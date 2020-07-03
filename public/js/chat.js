socket = io();

const messageInput = document.querySelector('#message');
const form = document.querySelector('#send');
const sendLocation = document.querySelector('#sendLocation');
const sendButton = document.querySelector('#sendMessage');
const messages = document.querySelector('#messages');

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true});

const autoscroll = () => {
    const newMessage = messages.lastElementChild
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin
    const visibleHeight = messages.offsetHeight
    const containerHeight = messages.scrollHeight
    const scrollOffset = messages.scrollTop + visibleHeight
    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}

socket.emit('join',{username,room},(error)=>{
    if(error)
    {
        location.href = '/';
        alert(error);
    }
})

socket.on('message',message=> {
    const html = Mustache.render(messageTemplate,{
        message:message.text,
        time:moment(message.time).format('h:mm a'),
        username:message.username
    });
    messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on('locationMessage',locationMessage=>{
    const html = Mustache.render(locationMessageTemplate,{
        url:locationMessage.url,
        time:moment(locationMessage.time).format('h:mm a'),
        username:locationMessage.username
    });
    messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on('userData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
})

form.addEventListener('submit',(event)=>{
    event.preventDefault();
    sendButton.setAttribute('disabled','disabled');
    socket.emit('sendMessage',messageInput.value,()=>{
        console.log("Message Delivered!");
        sendButton.removeAttribute('disabled');
        messageInput.value = '';
        messageInput.focus();
    });
})

sendLocation.addEventListener('click',()=>{
    if(navigator.geolocation)
    {
        sendLocation.setAttribute('disabled','disabled');
        navigator.geolocation.getCurrentPosition((location)=>{
            socket.emit('sendLocation',{latitude:location.coords.latitude,longitude:location.coords.longitude},(message)=>{
                console.log(message);
                sendLocation.removeAttribute('disabled');
            });
        });
    }
    else
        alert('Your browser does not support this feature');
})