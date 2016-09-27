var video = document.getElementById("videoElement");
navigator.getUserMedia = navigator.getUserMedia ||
						navigator.webkitGetUserMedia ||
						navigator.mozGetUserMedia ||
						navigator.oGetUserMedia;
if(navigator.getUserMedia){
	navigator.getUserMedia({video:true},handleVideo,videoError);
}

function handleVideo(stream){
video.src = window.URL.createObjectURL(stream);

onRequestAnimation();
}
function videoError(e){
	console.log('Errorrrrr',e);
}

var imgCount = 1;
function onRequestAnimation(){
	var videoCanvas = document.getElementById("videoCanvas");
	if(videoCanvas!= null){
		var ctx1 = videoCanvas.getContext("2d");
		var canvasWidth = videoCanvas.width;
		var canvasHeight = videoCanvas.height;

		ctx1.drawImage(video,0,0,canvasWidth,canvasHeight);
		var frame = ctx1.getImageData(0,0,canvasWidth,canvasHeight);
		var totalR = 0;
		var avgR;
		for(var n = 0; n<1200; n++){
			var x = Math.floor(Math.random() * frame.width);
			var y = Math.floor(Math.random() * frame.height);
			var pixIndex = y * frame.width +x;
			var thisR = frame.data[pixIndex * 4 + 0];
			totalR += thisR;
			avgR = totalR / 1200;
			
		}
		console.log(avgR);
		
		if(avgR < 40){
			imgCount ++;
		}
		else{
			imgCount = 1;
		}
			//if imgCount > the total num of the pics
		if(imgCount>5){
			imgCount = 1;
		}
		

		var string = "#" +"portrait" + imgCount;
		console.log(string);
		var showImage = function(string){
			$(string).removeClass('hide').addClass('show');
		}

		$('#portrait1').removeClass('show').addClass('hide');
		$('#portrait2').removeClass('show').addClass('hide');
		$('#portrait3').removeClass('show').addClass('hide');
		$('#portrait4').removeClass('show').addClass('hide');
		$('#portrait5').removeClass('show').addClass('hide');
		showImage(string);
	}
	requestAnimationFrame(onRequestAnimation);
}

function brightness(r,g,b){
	var brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
	return brightness;
}