// Assumes a normal webpage

    var lrs;
    try {
        lrs = new TinCan.LRS(
            {
                endpoint: "yourEndpoint",
                username: "your client username",
                password: "your client password",
                allowFail: false
            }
        );
    }
    catch (ex) {
        console.log("Failed to setup LRS object: " + ex);
        // TODO: do something with error, can't communicate with LRS
    }
    
    /* YouTube Players */
    
    //This code loads the IFrame Player API code asynchronously.
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    // This function creates an <iframe> (and YouTube player)
    // after the API code downloads.
    var youTubeplayer;
    var ytVideoID;
    var ytVideoTitle;
    var youTubeEmbeddedplayer;
    var ytEmbeddedVideoID;
    var ytEmbeddedVideoTitle;
    var lastPlayerTime;
    var lastPlayerState;
    var lastPlayer2Time;
    var lastPlayer2State;
    
    function onYouTubeIframeAPIReady() {
        // First Example
        // This will actually create the video iframe tag from an div element
        // with the id of player
        youTubeplayer = new YT.Player('player', {
            height: '390',
            width: '640',
            videoId: 'M7lc1UVf-VE', // YouTube video ID
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
        
        // Second Example
        // This assumes that you've already used the embed code to put the video
        // on the page
        youTubeEmbeddedplayer = new YT.Player('player2', {
            events: {
                'onReady': onPlayer2Ready,
                'onStateChange': onPlayer2StateChange
            }
        });
        ytVideoID = 'http://www.youtube.com/watch?v=' + youTubeplayer.b.c.videoId;
    }


    // The API will call this function when the video player is ready.
    
    // First player example
    function onPlayerReady(event) {
        ytVideoTitle = youTubeplayer.getVideoData().title;
    }
    
    //Second player example
    function onPlayer2Ready(event) {
        ytEmbeddedVideoID = 'http://www.youtube.com/watch?v=' + youTubeEmbeddedplayer.getVideoData()['video_id'];
        ytEmbeddedVideoTitle = youTubeEmbeddedplayer.getVideoData().title;
    }

    // The API calls this function when the player's state changes.
    // The function indicates that when playing a video (state=1),
    // the player should play for six seconds and then stop.
    var done = false;
    
    // First player example
    function onPlayerStateChange(event) {
        switch (event.data) {
            case (YT.PlayerState.PLAYING):
                break;
            case (YT.PlayerState.PAUSED):
                if (lastPlayerState == YT.PlayerState.PLAYING) {
                    videoWatched(lastPlayerTime, youTubeplayer.getCurrentTime(), ytVideoTitle, ytVideoID)
                } else if (lastPlayerState == YT.PlayerState.PAUSED) {
                    videoWatched(lastPlayerTime, youTubeplayer.getCurrentTime(), ytVideoTitle, ytVideoID);
                }
                break;
    	    case (YT.PlayerState.ENDED):
                //videoEnded();
                break;
    	    case (YT.PlayerState.UNSTARTED):
                break;
        }
        lastPlayerTime = youTubeplayer.getCurrentTime();
        lastPlayerState = event.data;
    }
    
    function onPlayer2StateChange(event) {
        switch (event.data) {
            case (YT.PlayerState.PLAYING):
                break;
            case (YT.PlayerState.PAUSED):
                if (lastPlayer2State == YT.PlayerState.PLAYING) {
                    videoWatched(lastPlayer2Time, youTubeEmbeddedplayer.getCurrentTime(), ytEmbeddedVideoTitle, ytEmbeddedVideoID)
                } else if (lastPlayerState == YT.PlayerState.PAUSED) {
                    videoWatched(lastPlayer2Time, youTubeEmbeddedplayer.getCurrentTime(), ytEmbeddedVideoTitle, ytEmbeddedVideoID);
                }
                break;
            case (YT.PlayerState.ENDED):
                //videoEnded();
                break;
        	case (YT.PlayerState.UNSTARTED):
                break;
        }
        
        lastPlayer2Time = youTubeEmbeddedplayer.getCurrentTime();
        lastPlayer2State = event.data;
    }
    
    function ytStopVideo() {
        youTubeplayer.stopVideo();
    }
    
    // videoWatched actually generates the statements
    // In this case, you need to figure out how to get an actor identifier
    function videoWatched(start, finish, videoTitle, videoID) {//start and finish in seconds
        var videoTinCan = new TinCan.Statement({
            actor: {
                mbox: "mailto:info@tincanapi.com"
            },
            verb: {
                id: "http://activitystrea.ms/schema/1.0/watch",
                display: {'en-US': 'watched'}
            },
            target: {
                id: videoID,
                definition: {
                    name: { "en-US": videoTitle + " from " + timeString(start) + " to " + timeString(finish) },
                    extensions: {
                        "http://yourEndpoint/extensions/start_point": timeString(start),
                        "http://youtEndpoint/extensions/end_point": timeString(finish)
                    }
                }
            }
        });

        lrs.saveStatement(
            videoTinCan,
            {
                callback: function (err, xhr) {
                    if (err !== null) {
                        if (xhr !== null) {
                            console.log("Failed to save statement: " + xhr.responseText + " (" + xhr.status + ")");
                            // TODO: do something with error, didn't save statement
                            return;
                        }
    
                        console.log("Failed to save statement: " + err);
                        // TODO: do something with error, didn't save statement
                        return;
                    }
    
                    console.log("Statement saved");
                    // TOOO: do something with success (possibly ignore)
                }
            }
        );
    }
    
    // This helper function helps to generate the human readable 
    // time in the statement
    function timeString (time) {
        //expecting seconds
        // multiply by 1000 because Date() requires miliseconds
        var date = new Date(time * 1000);
        var hh = date.getUTCHours();
        var mm = date.getUTCMinutes();
        var ss = date.getSeconds();
        var ms = date.getMilliseconds();
        // If you were building a timestamp instead of a duration, 
        // you would uncomment the following line to get 12-hour (not 24) time
        // if (hh > 12) {hh = hh % 12;}
        // These lines ensure you have two-digits
        if (hh < 10) {hh = "0"+hh;}
        if (mm < 10) {mm = "0"+mm;}
        if (ss < 10) {ss = "0"+ss;}
        // This formats your string to HH:MM:SS
        return hh + ":" + mm + ":" + ss + ":" + ms;
    }

    /* Limelight Player */
    
    
    // This only works when online
    // Uses the Limelight player API
    function limelightPlayerCallback (playerId, eventName, data) {
        var id = "limelightplayerID";
        var playerForm = 'yourLimeLightPlayerFormCode';
        var limelightVideoID = 'http://link.videoplatform.limelight.com/media/?mediaId=' + data.id + '&width=956&height=592&playerForm=' + playerForm;
        var limelightTitle;
        if (eventName == 'onPlayerLoad' && (LimelightPlayer.getPlayers() == null || LimelightPlayer.getPlayers().length == 0))
        {
            LimelightPlayer.registerPlayer(id);
        }
        
        switch(eventName) {
            case 'onPlayerLoad':
                console.log("Player Loaded");
            break;
            case 'onMediaLoad':
                console.log("Loaded media '" + data.title + "'");
                limelightTitle = data.title;
                break;
            case 'onPlayStateChanged':
                // Limelight API isPlaying is a bit weird in that it fires a few
                // times as it's loading.
                // lastPlayerTime must be calculated here in order to
                // get an accurate timestamp
                if (data.isPlaying){
                    lastPlayerTime = currentPlayerTime;
                    videoWatched(lastPlayerTime, currentPlayerTime, limelightTitle , limelightVideoID);
                    // console.log("video is playing");
                } else if (!data.isPlaying){
                    videoWatched(lastPlayerTime, currentPlayerTime, limelightTitle , limelightVideoID);
                    // console.log("video is not playing");
                }
                lastPlayerState = data.isPlaying;
                break;
            case 'onPlayheadUpdate':
                // PlayheadUpdate fires several times a second
                currentPlayerTime = data.positionInMilliseconds *= 0.001;
                break;
        }
    }