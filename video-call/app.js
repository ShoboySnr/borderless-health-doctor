function generateToken() {
    auth.onAuthStateChanged((user) => {
        if(user) {
            auth.currentUser.getIdToken(true).then((idToken) => {

                const data = {
                    "room": "test-room",
                    "identity": "doctor"
                };
            
                let request = cbrRequest('/token', 'POST', true, idToken);

                request.onload = (response) => {
                    let data = JSON.parse(request.response);

                    if (request.status >= 200 && request.status < 400) {
                        const identity = data.data.identity;
                        const token = data.data.token;

                        console.log(identity, token);

                        connectVideo(token);
                    }
                }

                request.send(JSON.stringify(data))
            
        }).catch(function(error) {
            // Handle error
            console.error(`Error: ${error}`);
        });
        }
    })
}

function connectVideo(token) {
    const { connect } = twilioVideo;

    connect(`${token}`, { name: 'existing-room' }).then(room => {
        console.log(`Successfully joined a Room: ${room}`);
        room.on('participantConnected', participant => {
          console.log(`A remote Participant connected: ${participant}`);
        });
      }, error => {
        console.error(`Unable to connect to Room: ${error.message}`);
      });
}