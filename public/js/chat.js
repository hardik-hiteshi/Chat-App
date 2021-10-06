const socket =  io();

//server (emit)  --> cleint (receives) -Acknowledgement --> server
//cleint (emit)  --> server (receives) -Acknowledgement --> client

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')

const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options:
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix : true })

const autscroll = () => {
    //New Message Element
    const $newMessage = $messages.lastElementChild

    //Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessagemargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessagemargin

    //visible Height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const containerHeight = $messages.scrollHeight

    //How far we have scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

//===================================================================================
socket.on('message',(message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username : message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('hh:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autscroll()
})

//===================================================================================
socket.on('locationMessage', (message) => {
    console.log(message);
    const html = Mustache.render(locationMessageTemplate, {
        username : message.username,
        url : message.url,
        createdAt : moment(message.createdAt).format('hh:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autscroll()
})

//===================================================================================
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room: room,
        users : users
    })
    document.querySelector('#sidebar').innerHTML = html
})

//===================================================================================
$messageForm.addEventListener('submit',(e) => {
    e.preventDefault()
    
    //disable
    $messageFormButton.setAttribute('disabled','disabled')
    
    
    const message = e.target.elements.message.value

    socket.emit('sendMessage', message , (error) => {

            //enable
            $messageFormButton.removeAttribute('disabled')
            $messageFormInput.value = ''
            $messageFormInput.focus()

        
        if(error) { 
            return console.log(error);
        }

        console.log("The Message was delivered!");
    })
})

//===================================================================================
$sendLocationButton.addEventListener('click' , () => {
    if(!navigator.geolocation) {
        return alert('GeoLocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('diabled','disabled')

    navigator.geolocation.getCurrentPosition( (position) => {
        //console.log(position);
        socket.emit('sendLocation' , {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        }, () => {

            $sendLocationButton.removeAttribute('disabled')
            console.log('Lcoation Shared!');
        })
    })
})

//===================================================================================
socket.emit('join', { username, room },(error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }

})

//===================================================================================


// socket.on('countUpdated', (count) => {
//     console.log("Counted Updated Successfully",count);
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log("clicked");

//     socket.emit('increment')
// })