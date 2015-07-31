// var courseID = "";  // e.g. "BJCx"
// // taskID uniquely identifies the task for saving in browser localStorage.
// var taskID = "AG_D1_T1";
// var id = courseID + taskID;

var AG_state = {
    'checkState': false,
    'comment': "Please run the Snap Autograder before clicking the 'Submit' button.",
    'feedback': {}
};

var AG_EDX = (function() {
    
    var channel;

    if (window.parent !== window) {
        channel = Channel.build({
            window: window.parent,
            origin: "*",
            scope: "JSInput"
        });

        channel.bind("getGrade", getGrade);
        channel.bind("getState", getState);
        channel.bind("setState", setState);
    }

    // The following return value may or may not be used to grade
    // server-side.
    // If getState and setState are used, then the Python grader also gets
    // access to the return value of getState and can choose it instead to
    // grade.
    function getGrade() {
        //Grab Snap ide and testLog, null if AGTest() has not been called.
        var ide = world.children[0];
        // console.log("THE ID IS: " + id);
        if (localStorage.getItem(id + "_test_log") !== null){
            var glog = JSON.parse(localStorage.getItem(id + "_test_log"));
            var snapXML = localStorage.getItem(id + "_test_state");
            // console.log(snapXML);
            //Save Snap XML in Local Storage
            // localStorage.setItem(id, xmlString); 
            //If AGTest() has been called, save the gradeLog in 
            if (glog !== undefined) {
                //Convert to an AG_state
                var edx_log = AG_log(glog, snapXML);
                edx_log["snapXML"] = snapXML;
                console.log(JSON.stringify(edx_log));

                //saves correct student answer, as well as state, in case student returns to question
                localStorage.setItem(id + "_last_submitted_log", localStorage.getItem(id + "_test_log"));
                localStorage.setItem(id + "_last_submitted_state", snapXML);
                //localStorage.setItem(id + "_ag_output", JSON.stringify(edx_log));
            }
            console.log("GET GRADE SUCCEEDING");
            //console.log(encodeURIComponent(JSON.stringify(edx_log)));

            return encodeURIComponent(JSON.stringify(edx_log));
        } else {
            return JSON.stringify(AG_state);
        }



    }

    function getState() {
        // return encodeURIComponent(JSON.stringify(AG_state));

        // if _test_state and _test_log exist
            // encode world and state
        // else
            // return 'never graded'

        var graded_xml = localStorage.getItem(id + "_test_state");
        var graded_log = localStorage.getItem(id + "_test_log");
        if (!graded_xml || !graded_log) {
            return 'never graded';
        }
        var output = encodeURI(JSON.stringify({out_log:graded_log,state:encodeURIComponent(graded_xml)}));
        console.log(output);
        return output;

        // var last_xml = localStorage.getItem(id + "_test_state");
        // if (last_xml !== null) {
        //     return encodeURI(encodeURIComponent(last_xml));
        // } else {
        //     var ide = world.children[0];
        //     var world_string = ide.serializer.serialize(ide.stage);
        //     return encodeURI(encodeURIComponent(world_string);
        // }

        // var ide = world.children[0];
        // var world_string = ide.serializer.serialize(ide.stage);
        // //return encodeURI(encodeURIComponent(world_string));
        // return encodeURI(world_string);
    }

    //EDX: Used to save the world state into edX. FOR RELOAD 
    function setState() {
        console.log('SET STATE IS CALLED');
        var last_state_string = arguments.length === 1 ? arguments[0] : arguments[1];
        var ide = world.children[0];
        if (last_state_string === 'starter file') {
            var starter_xml = $.get(starter_path, function(data) {
                sessionStorage.setItem("starter_file", data)},
                //console.log(data);
                //ide.openProjectString(data)}, 
                "text"); //TODO: Loading here still unsafe
            return;
        } else if (last_state_string === 'never graded') {
            return;
        } else {
            var last_state = JSON.parse(last_state_string);
            console.log(last_state);
            last_state.state = decodeURIComponent(last_state.state);
            localStorage.setItem(id + '_test_state', last_state.state);
            localStorage.setItem(id + '_test_log', last_state.out_log);
        }





        // var last_xml = arguments.length === 1 ? arguments[0] : arguments[1];
        
        // var ide = world.children[0];
        // if (last_xml === "starter file") {
        //     var starter_xml = $.get(starter_path, function(data) {
        //         console.log(data);
        //         ide.openProjectString(data)}, "text");
        //     return
        // }
        // console.log(last_xml);
        // //var last_xml = arguments.length === 1 ? arguments[0] : arguments[1];
        // //state = JSON.parse(stateStr);
        
        // //ide.openProjectString(decodeURIComponent(last_xml));
        // ide.openProjectString(last_xml);
        


    }

    return {
        getState: getState,
        setState: setState,
        getGrade: getGrade};
}());