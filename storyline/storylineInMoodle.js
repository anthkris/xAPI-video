    // This code was built for a Storyline 2 course 
    // using the xAPI Launch Link plugin in Moodle 3.1
    
    // Assumes YouTube Video
    
    // Followed a tip from the Storyline forum and am including TinCan JS as a
    // web object so that it gets into the page each publish without having to
    // update the story.html file each time
    
    // Need to put a specific id on the iframe for reference later
    document.getElementsByTagName('iframe')[0].setAttribute("id", "player2");
    
    // For the YouTube Iframe API to work, need to enable it
    // As a precaution, also add the origin url
    document.getElementsByTagName('iframe')[0].src = document.getElementsByTagName('iframe')[0].src + "?enablejsapi=1&origin=http://yoursite.com";
    
    // This function helps in the operation to get the current user's email address
    // Gets params from window url (works with xAPI launch plugin in Moodle)
    // Assumes paramaters are separated by &
    function getAllUrlParams(url) {
      // get query string from url (optional) or window
      var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

      // we'll store the parameters here
      var obj = {};

      // if query string exists
      if (queryString) {

        // stuff after # is not part of query string, so get rid of it
        queryString = queryString.split('#')[0];

        // split our query string into its component parts
        var arr = queryString.split('&');

        for (var i=0; i<arr.length; i++) {
          // separate the keys and the values
          var a = arr[i].split('=');

          // in case params look like: list[]=thing1&list[]=thing2
          var paramNum = undefined;
          var paramName = a[0].replace(/\[\d*\]/, function(v) {
            paramNum = v.slice(1,-1);
            return '';
          });

          // set parameter value (use 'true' if empty)
          var paramValue = typeof(a[1])==='undefined' ? true : a[1];

          // (optional) keep case consistent
          paramName = paramName.toLowerCase();
          paramValue = paramValue.toLowerCase();

          // if parameter name already exists
          if (obj[paramName]) {
            // convert value to array (if still string)
            if (typeof obj[paramName] === 'string') {
              obj[paramName] = [obj[paramName]];
            }
            // if no array index number specified...
            if (typeof paramNum === 'undefined') {
              // put the value on the end of the array
              obj[paramName].push(paramValue);
            }
            // if array index number specified...
            else {
              // put the value at that index number
              obj[paramName][paramNum] = paramValue;
            }
          }
          // if param name doesn't exist yet, set it
          else {
            obj[paramName] = paramValue;
          }
        }
      }

      return obj;
    }
    
    //Get the params as an object
    var params = getAllUrlParams(window.top.location.href);
    
    //Decode the params to get the proper symbols
    var paramsDecoded = decodeURIComponent(params.actor);
    
    // Parse the JSON
    var paramsObject = JSON.parse(paramsDecoded);
    
    // Save the mbox and name as variables
    var currentUserActor = paramsObject.mbox;
    var currentUserName = paramsObject.name;
    
    // Put in LRS endpoint, client username and key
    var lrs;
        try {
            lrs = new TinCan.LRS(
                {
                    endpoint: "your Endpoint",
                    username: "client username",
                    password: "clent password",
                    allowFail: false
                }
            );
        }
        catch (ex) {
            console.log("Failed to setup LRS object: " + ex);
            // TODO: do something with error, can't communicate with LRS
        }

    //  This code loads the IFrame Player API code asynchronously.
    // Doesn't seem to work in Storyline in Moodle (works outside of Moodle)
    // Or may not embed the tag quickly enough to be used
    // Update story.html and story_html5.html to include the script tag
    function loadScript() {
        if (typeof(YT) == 'undefined' || typeof(YT.Player) == 'undefined') {
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            window.onYouTubePlayerAPIReady = function() {
                onYouTubePlayer();
            };
        } else {
            onYouTubePlayer();
        }
    }

    // This function creates an <iframe> (and YouTube player)
    //  after the API code downloads.
    var youTubeEmbeddedplayer;
    var ytEmbeddedVideoID;
    var ytEmbeddedVideoTitle;
    var lastPlayer2Time;
    var lastPlayer2State;
    
    function onYouTubePlayer(){
        youTubeEmbeddedplayer = new YT.Player('player2', {
            events: {
                'onReady': onPlayer2Ready,
                'onStateChange': onPlayer2StateChange
            }
        });
    }
        
    // 4. The API will call this function when the video player is ready.
    function onPlayer2Ready(event) {
        ytEmbeddedVideoID = 'http://www.youtube.com/watch?v=' + youTubeEmbeddedplayer.getVideoData().video_id;
        ytEmbeddedVideoTitle = youTubeEmbeddedplayer.getVideoData().title;
    }

    // The API calls this function when the player's state changes.
    // The current snippet only uses video watched
    // You can update this to account for other player states
    var done = false;
    
    function onPlayer2StateChange(event) {
        switch (event.data) {
      	case (YT.PlayerState.PLAYING):
          //videoStarted();
          break;
      	case (YT.PlayerState.PAUSED):
            if (lastPlayer2State == YT.PlayerState.PLAYING) {
                videoWatched(lastPlayer2Time, youTubeEmbeddedplayer.getCurrentTime(), ytEmbeddedVideoTitle, ytEmbeddedVideoID);
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
    function videoWatched(start, finish, videoTitle, videoID) {
        //start and finish paramaters expect time in seconds
        var videoTinCan = new TinCan.Statement({
            actor: {
                mbox: currentUserActor,
                name: currentUserName
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
                        "http://yourEndpoint/extensions/end_point": timeString(finish)
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

    // This helper function turns the timestamp into something human readable
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