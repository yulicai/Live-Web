//https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement

var socket = io.connect();

//var ChatName = {};
//
//function User(userPrompt){
//    this.userName = userPrompt;
//}

var userName;
var target = "all";

socket.on('connect', function() {
    console.log("Connected");
    userName = prompt("Please enter a username");
});

function display(addClass, data) {
    var newLine = document.createElement('p');
    var userText = document.createAttribute('class');
    userText.value= addClass;
    var newMessage = document.createTextNode(data);
    newLine.appendChild(newMessage); 
    newLine.setAttributeNode(userText);
    var chatArea = document.getElementById('messages');
    chatArea.appendChild(newLine);
}

var smallAd = ["tiny", "small", "little"];
var funnyAd = ["funny", "lol", "haha"];

// Receive from any event
socket.on('chatmessage', function (data, message, senderName, id, target1) {
    var link = "http://www.indianfunpic.com/wp-content/uploads/2016/06/Funny-Kids-14.jpg";   
    var funnypic1 = "<img src=" + link + ">";
    
    if (userName == target1){
        if(message.indexOf("end--") >= 0){
            socket.emit('close');
        }
        else{
            display("private", data);
        }
    }
     
    else if (id == socket.id){
        display("user", data);
    }
    
    else if (target1 == "all" && message.includes(" win")){
//        var holdImage = document.createElement("IMG");
//        var srcImage = document.createAttribute("SRC")
//        srcImage.value = "http://www.indianfunpic.com/wp-content/uploads/2016/06/Funny-Kids-14.jpg";
//        holdImage.setAttributeNode(srcImage);
//        
            
        var chatArea = document.getElementById('messages');
    //chatArea.appendChild(srcImage);
        chatArea.innerHTML += '<img src="http://www.indianfunpic.com/wp-content/uploads/2016/06/Funny-Kids-14.jpg">';
        
//        console.log("yayyyy");
//        document.getElementById('messages').innerHTML = "" + funnypic1 + "" + document.getElementById('messages').innerHTML;
    }
    
    else if (target1 != "all" && userName != target1){
        console.log("people are talking about you");
    }
    
    else if (target1 = "all" && message.indexOf("small") >= 0 || message.indexOf("tiny") >= 0){
        display("usersmall", data);
    }
    
    else if (target1 = "all" && message.indexOf("pink") >= 0 || message.indexOf("yellow") >= 0 || message.indexOf("red") >= 0){
        display("pink", data);
    }
    
    else if (target1 = "all" && message.indexOf("lemon") >= 0 || message.indexOf("lime") >= 0 || message.indexOf("stool") >= 0) {
        display("userWhite", data);
    }

    else if (target1 = "all" && message.indexOf("fruit") >= 0 || message.indexOf("round") >= 0 || message.indexOf("sour") >= 0 || message.indexOf("legs") >= 0 || message.indexOf("back") >= 0 ){
       display("userjoke", data);
    }
    
    else{
       display("chatPartner", data);
    }
    
    console.log("Sender ID: " + id);
});

socket.on('closeWindow', function(){
    var doc = document.getElementsByTagName("BODY")[0].innerHTML="Your time in the game has ended";
    socket.emit('boot');
});

var sendmessage = function(message) {
    var data = userName + ": " + message
    socket.emit('chatmessage',  data, message, userName, socket.id, target);
    var formField = document.getElementById('message');
    formField.value = ' ';
};

var setTarget = function(bullseye){
  target = bullseye;
};