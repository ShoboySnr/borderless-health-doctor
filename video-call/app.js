async function joinRoom() {
    const inner_loader = document.getElementById('triggerVideoModal').querySelector('.inner-loader-class');

    //load screen
    inner_loader.setAttribute('style', 'display: flex;');

    auth.onAuthStateChanged(async (user) => {
        if(user) {
            const roomName = user.displayName ?  `${user.displayName}'s Room` : `${user.email}'s Room`;
            
            await auth.currentUser.getIdToken(true).then((idToken) => {

                const data = {
                    "room": "test-room",
                    "identity": "doctor"
                };
            
                let request = cbrRequest('/token', 'POST', true, idToken);

                request.onload = async (response) => {
                    let data = JSON.parse(request.response);

                    if (request.status >= 200 && request.status < 400) {
                        const identity = data.data.identity;
                        const token = data.data.token;

                        console.log(identity, token);

                        await connectVideo(token, roomName, inner_loader, event);

                    }
                }

                request.send(JSON.stringify(data))
            
        }).catch(function(error) {
            // Handle error
            console.error(`Error: ${error}`);
            document.getElementById('#local-media-container').innerHTML = `There was an error loading the vide: Error: ${error.message}`;
            inner_loader.setAttribute('style', 'display: none;');
        });
            
        } else {
            window.location.href = '/login';
        }
    });
}

async function connectVideo(token, roomName, inner_loader, event) {
    const localTracks = await twilioVideo.createLocalTracks({
        audio: true,
        video: { width: 640 },
    });
    const { connect } = twilioVideo;

    const room = await connect(`${token}`, { name: roomName, tracks: localTracks }).then(room => {
        console.log(`Successfully joined a Room: ${room}`);
        room.on('participantConnected', participant => {
        console.log(`A remote Participant connected: ${participant}`);
    });
    }, error => {
        console.error(`Unable to connect to Room: ${error.message}`);
    });

    const localMediaContainer = document.getElementById("local-media-container");
    inner_loader.setAttribute('style', 'display: none;');
    localTracks.forEach((localTrack) => {
        localMediaContainer.appendChild(localTrack.attach());
    });

    //append video, mute and cancel buttons
    let divElement = document.createElement('div');
    divElement.className += 'bh-video-button-group';

    let videoButton = document.createElement('button');
    videoButton.className = 'bh-primary-button';
    videoButton.textContent = '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M26.766 10.5184C26.766 8.88921 25.4411 7.56433 23.812 7.56433H6.08781C4.45867 7.56433 3.13379 8.88921 3.13379 10.5184V25.2885C3.13379 26.9176 4.45867 28.2425 6.08781 28.2425H23.812C25.4411 28.2425 26.766 26.9176 26.766 25.2885V20.3656L32.674 25.2885V10.5184L26.766 15.4412V10.5184ZM23.8149 25.2885H6.08781V10.5184H23.812L23.8134 17.9019L23.812 17.9034L23.8134 17.9049L23.8149 25.2885V25.2885Z" fill="#0089E5"/></svg>';

    divElement.appendChild(videoButton);


    localMediaContainer.appendChild(divElement);

    // display video/audio of other participants who have already joined
    room.participants.forEach(onParticipantConnected);

    // subscribe to new participant joining event so we can display their video/audio
    room.on("participantConnected", onParticipantConnected);

    room.on("participantDisconnected", onParticipantDisconnected);

    toggleButtons();

    event.preventDefault(); 
}


// when a participant disconnects, remove their video and audio from the DOM.
const onParticipantDisconnected = (participant) => {
  const participantDiv = document.getElementById(participant.sid);
  participantDiv.parentNode.removeChild(participantDiv);
};

const onParticipantConnected = (participant) => {
  const participantDiv = document.createElement("div");
  participantDiv.id = participant.sid;

  // when a remote participant joins, add their audio and video to the DOM
  const trackSubscribed = (track) => {
    participantDiv.appendChild(track.attach());
  };
  participant.on("trackSubscribed", trackSubscribed);

  participant.tracks.forEach((publication) => {
    if (publication.isSubscribed) {
      trackSubscribed(publication.track);
    }
  });

  document.body.appendChild(participantDiv);

  const trackUnsubscribed = (track) => {
    track.detach().forEach((element) => element.remove());
  };

  participant.on("trackUnsubscribed", trackUnsubscribed);
};

const onLeaveButtonClick = (event) => {
  room.localParticipant.tracks.forEach((publication) => {
    const track = publication.track;
    // stop releases the media element from the browser control
    // which is useful to turn off the camera light, etc.
    track.stop();
    const elements = track.detach();
    elements.forEach((element) => element.remove());
  });
  room.disconnect();

  toggleButtons();
};

const toggleButtons = () => {
  document.getElementById("leave-button").classList.toggle("hidden");
  document.getElementById("join-button").classList.toggle("hidden");
};


window.addEventListener('DOMContentLoaded', () => {
    const joinButton = document.getElementById("join-button");
    
    joinButton.addEventListener("click", async (event) => {
        $('#triggerVideoModal').modal({
            fadeDuration: 350,
            escapeClose: false,
            clickClose: false,
            showClose: false
        });
        await joinRoom();
    });


    if(document.querySelector('#triggerVideoModal .modal-container')) {
        document.querySelector('#triggerVideoModal .modal-container').addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            return;
        })
    }

    if(document.getElementById('triggerVideoModal')) {
        document.getElementById('triggerVideoModal').addEventListener('click', (event) => {
            $.modal.close();
        })
    }
    // const leaveButton = document.getElementById("leave-button");
    // leaveButton.addEventListener("click", onLeaveButtonClick);
})