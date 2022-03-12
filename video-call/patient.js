const { connect, createLocalTracks, RemoteAudioTrack, RemoteParticipant, RemoteTrack,  RemoteVideoTrack, Room } = twilioVideo;
let isAudioMuted = false;
let isVideoMuted = false;

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
                    "identity": "patient"
                };
            
                let request = cbrRequest('/token', 'POST', true, idToken);

                request.onload = async () => {
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

    const localTracks = await createLocalTracks({
        audio: true,
        video: { height: 720, frameRate: 24, width: 1280 },
    });

    const localMediaContainer = document.getElementById("local-media-container");
    inner_loader.setAttribute('style', 'display: none;');

    const currentUserElement = document.createElement('div');
    localTracks.forEach((localTrack) => {
        console.log(localTrack);
        currentUserElement.appendChild(localTrack.attach());
    });

    localMediaContainer.appendChild(currentUserElement)

    //append image tag
    let imgElement = document.createElement('img');
    imgElement.src = 'https://www.kindpng.com/picc/m/207-2074624_white-gray-circle-avatar-png-transparent-png.png';
    imgElement.width = 200;
    imgElement.height = 130;
    imgElement.id = 'bh-doctor-avatar';
    imgElement.style.display = 'none';

    localMediaContainer.append(imgElement);

        //append message notification
    let messageElement = document.createElement('div');
    messageElement.className = 'bh-video-notification';
    messageElement.id = 'bh-video-notification';

    localMediaContainer.appendChild(messageElement);

    //append video, mute and cancel buttons
    let divElement = document.createElement('div');
    divElement.className = 'bh-video-button-group';

    let videoButton = document.createElement('button');
    videoButton.className = 'bh-video-call-button bh-primary-button';
    videoButton.id = 'video-button';
    videoButton.innerHTML = '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M26.766 10.5184C26.766 8.88921 25.4411 7.56433 23.812 7.56433H6.08781C4.45867 7.56433 3.13379 8.88921 3.13379 10.5184V25.2885C3.13379 26.9176 4.45867 28.2425 6.08781 28.2425H23.812C25.4411 28.2425 26.766 26.9176 26.766 25.2885V20.3656L32.674 25.2885V10.5184L26.766 15.4412V10.5184ZM23.8149 25.2885H6.08781V10.5184H23.812L23.8134 17.9019L23.812 17.9034L23.8134 17.9049L23.8149 25.2885V25.2885Z" fill="#0089E5"/></svg>';

    videoButton.addEventListener('click', (event) => {
        let element = event.target;
        const videoButtonEl = document.querySelector('#local-media-container #video-button');
        if(videoButtonEl.classList.contains('bh-video-disabled')) {
            room.localParticipant.videoTracks.forEach(publication => {
                publication.track.enable();
            });
            videoButtonEl.classList.remove('bh-video-disabled');
        } else {
            room.localParticipant.videoTracks.forEach(publication => {
                publication.track.disable();
            });
            videoButtonEl.classList.add('bh-video-disabled');
        }
    });


    let muteButton = document.createElement('button');
    muteButton.className = 'bh-video-call-button bh-primary-button';
    muteButton.id = 'mute-button';
    muteButton.innerHTML = '<svg width="37" height="36" viewBox="0 0 37 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30.1219 15.8957C30.1219 15.7434 29.9973 15.6188 29.845 15.6188H27.7679C27.6156 15.6188 27.491 15.7434 27.491 15.8957C27.491 20.7525 23.555 24.6885 18.6982 24.6885C13.8413 24.6885 9.90534 20.7525 9.90534 15.8957C9.90534 15.7434 9.78072 15.6188 9.6284 15.6188H7.55135C7.39904 15.6188 7.27441 15.7434 7.27441 15.8957C7.27441 21.7357 11.657 26.5544 17.3135 27.2364V30.7812H12.2836C11.8093 30.7812 11.4285 31.2762 11.4285 31.889V33.1352C11.4285 33.2875 11.5254 33.4121 11.6431 33.4121H25.7532C25.8709 33.4121 25.9678 33.2875 25.9678 33.1352V31.889C25.9678 31.2762 25.587 30.7812 25.1128 30.7812H19.9444V27.2537C25.6667 26.6306 30.1219 21.7841 30.1219 15.8957ZM18.6982 21.7807C21.9488 21.7807 24.5831 19.1774 24.5831 15.9649V8.21063C24.5831 4.99813 21.9488 2.3949 18.6982 2.3949C15.4476 2.3949 12.8132 4.99813 12.8132 8.21063V15.9649C12.8132 19.1774 15.4476 21.7807 18.6982 21.7807ZM15.4441 8.21063C15.4441 6.45899 16.8946 5.02582 18.6982 5.02582C20.5017 5.02582 21.9522 6.45899 21.9522 8.21063V15.9649C21.9522 17.7166 20.5017 19.1497 18.6982 19.1497C16.8946 19.1497 15.4441 17.7166 15.4441 15.9649V8.21063Z" fill="#0089E5"/></svg>';

    muteButton.addEventListener('click', (event) => {
        let element = event.target;
        const muteButtonEl = document.querySelector('#local-media-container #mute-button');
        if(muteButtonEl.classList.contains('bh-video-disabled')) {
            room.localParticipant.audioTracks.forEach(publication => {
                publication.track.enable();
            });
            muteButtonEl.classList.remove('bh-video-disabled');
        } else {
            room.localParticipant.audioTracks.forEach(publication => {
                publication.track.disable();
            });
            muteButtonEl.classList.add('bh-video-disabled');
        }
    });

    let cancelButton = document.createElement('button');
    cancelButton.className = 'bh-video-call-button bh-secondary-button';
    cancelButton.id = 'leave-button';
    cancelButton.innerHTML = '<svg width="36" height="35" viewBox="0 0 36 35" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.9855 10.5468C23.6918 10.5399 27.5519 12.732 30.2372 15.1022C31.3675 16.0989 31.8847 17.5991 31.6159 19.0068L31.347 20.4283C31.0935 21.7572 29.8485 22.6512 28.439 22.5142L25.6356 22.2436C24.4128 22.1254 23.5069 21.2332 23.1232 19.9659C22.6026 18.2448 22.267 16.9689 22.267 16.9689C20.9147 16.3894 19.4566 16.0978 17.9855 16.1126C16.249 16.1126 15.0091 16.4808 13.7041 16.9689C13.7041 16.9689 13.3548 18.2465 12.8478 19.9659C12.5088 21.115 11.9847 22.1186 10.7876 22.2385L7.99957 22.5193C7.32064 22.5845 6.63994 22.4141 6.07177 22.0368C5.5036 21.6595 5.08253 21.0982 4.87927 20.4471L4.45455 19.0291C4.24406 18.3504 4.22493 17.6267 4.39928 16.9378C4.57362 16.2488 4.93468 15.6214 5.44271 15.1245C7.88311 12.7508 12.2878 10.5519 17.9855 10.5468ZM23.9367 16.587L23.9812 16.7497L24.1491 17.3628C24.2963 17.8868 24.5053 18.6232 24.7622 19.4692C24.9968 20.2416 25.4301 20.5036 25.8 20.5396L28.6035 20.8102C29.196 20.8667 29.5882 20.5071 29.6652 20.108L29.9341 18.6866C30.0055 18.2639 29.9666 17.8299 29.821 17.4267C29.6755 17.0235 29.4284 16.6646 29.1035 16.3849C26.6631 14.2322 23.1917 12.2525 17.989 12.2593C12.7211 12.2662 8.74796 14.3007 6.63636 16.3524C6.35263 16.6311 6.15182 16.9831 6.05627 17.3693C5.96073 17.7554 5.9742 18.1604 6.09519 18.5393L6.51991 19.959C6.67575 20.4831 7.23919 20.8735 7.82831 20.8153L10.6164 20.5345C10.6832 20.5276 10.7054 20.5139 10.7088 20.5122C10.7423 20.4891 10.7714 20.4601 10.7945 20.4266C10.9144 20.2759 11.0565 19.9899 11.2055 19.4829C11.4741 18.5698 11.7361 17.6547 11.9916 16.7377L12.0378 16.5716C12.2125 15.9431 12.8222 15.5064 13.1047 15.3642C14.5073 14.8402 15.9647 14.4 17.9855 14.4C19.9807 14.4 21.4672 14.7905 22.9177 15.3848C23.1763 15.4909 23.7432 15.8711 23.923 16.5339L23.9264 16.5459L23.9367 16.587Z" fill="white"/></svg>';

    cancelButton.addEventListener('click', (event) => {
        let element = event.target;
        const leaveButtonEl = document.querySelector('#local-media-container #leave-button');
        room.on('disconnected', room => {
            // Detach the local media elements
            room.localParticipant.tracks.forEach(publication => {
                const attachedElements = publication.track.detach();
                attachedElements.forEach(element => element.remove());
            });

            const notice = document.getElementById('bh-video-notification');
            notice.setAttribute('style', 'display:flex;')
            notice.innerHTML = '<p>Participant left</p>';
            $.modal.close();
        });
        room.disconnect();
    })

    divElement.appendChild(videoButton);
    divElement.appendChild(muteButton);
    divElement.appendChild(cancelButton);


    localMediaContainer.appendChild(divElement);

    const room = await connect(`${token}`, { name: roomName,
        audio: true,
        video: { height: 720, frameRate: 24, width: 1280 },
        bandwidthProfile: {
          video: {
            mode: 'collaboration',
            dominantSpeakerPriority: 'standard'
          }
        },
        dominantSpeaker: true,
        maxAudioBitrate: 16000,
        preferredVideoCodecs: [{ codec: 'VP8', simulcast: true }],
        networkQuality: {local:1, remote: 1}, 
        tracks: localTracks });

    // display video/audio of other participants who have already joined
    room.participants.forEach(onParticipantConnected);

    // subscribe to new participant joining event so we can display their video/audio
    room.on("participantConnected", onParticipantConnected);

    room.on("participantDisconnected", onParticipantDisconnected);

    room.participants.forEach(participant => {
        participant.tracks.forEach(publication => {
          if (publication.isSubscribed) {
            handleTrackDisabled(publication.track);
          }
          publication.on('subscribed', handleTrackDisabled);
          publication.on('unsubscribed', handleTrackDisabled);
        });
      });

    event.preventDefault();
}

function handleTrackDisabled(track) {
    console.log(track);
    track.on('disabled', (event) => {
        const notice = document.getElementById('bh-video-notification');
        notice.innerHTML = '<p>Participant is muted</p>';
        notice.setAttribute('style', 'display:flex;')
        console.log(event);
        document.querySelector('local-media-container video').setAttribute('style', 'display:none;')
        document.querySelector('img#bh-doctor-avatar').setAttribute('style', 'display:block;')
      /* Hide the associated <video> element and show an avatar image. */
    });
    track.on('enabled', () => {
        const notice = document.getElementById('bh-video-notification');
        notice.innerHTML = '<p>Participant is unmuted</p>';
        notice.setAttribute('style', 'display:flex;')
        console.log(event);
        /* Hide the avatar image and show the associated <video> element. */
        document.querySelector('local-media-container video').setAttribute('style', 'display:block;')
        document.querySelector('img#bh-doctor-avatar').setAttribute('style', 'display:none;')
    });
}

const onParticipantDisconnected = (participant) => {
    console.log(participant);
    const participantDiv = document.getElementById(participant.sid);
    participantDiv.parentNode.removeChild(participantDiv);
};

const onParticipantConnected = (participant) => {
    const participantDiv = document.createElement("div");
    participantDiv.id = participant.sid;
    participantDiv.className = 'bh-participants-video';
  
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
  
    document.getElementById('local-media-container').appendChild(participantDiv);
  
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


    // if(document.querySelector('#triggerVideoModal .modal-container')) {
    //     document.querySelector('#triggerVideoModal .modal-container').addEventListener('click', (event) => {
    //         event.preventDefault();
    //         event.stopPropagation();
    //         return;
    //     })
    // }

    // if(document.getElementById('triggerVideoModal')) {
    //     document.getElementById('triggerVideoModal').addEventListener('click', (event) => {
    //         $.modal.close();
    //     })
    // }
    // const leaveButton = document.getElementById("leave-button");
    // leaveButton.addEventListener("click", onLeaveButtonClick);
})