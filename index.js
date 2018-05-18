Array.prototype.contains = function ( needle ) {
  for (i in this) {
    if (this[i] == needle) return true;
  }
  return false;
}

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
//画形状用的全局变量
var W = 1300; //document.body.clientWidth;
var H = 660;  //document.body.clientHeight;
var R = 20;   //圆形的半径，以确定各图形的大小
var RED = 'rgb(255,0,0)';
var BLUE = 'rgb(0,255,255)';
var YELLOW = 'rgb(255,255,0)';
var GREEN = 'rgb(0,255,0)';
var WHITE = 'rgb(255,255,255)';
var COLORS = [RED, BLUE, YELLOW, GREEN];
var COLOR_NAMES = ["RED", "BLUE", "YELLOW", "GREEN"];
var shapes = [];  //形状的对象数组
//游戏全局变量
var INIT_NUM = 10;  //初始复杂度
var EACH_ROUND = 10;  //每种复杂度算一轮，一轮做10次实验
var EACH_ROUND3 = 3;	//每轮提3个问题，必须<=7
var discoverGamePlaying = false;
var perceiveGamePlaying = false;
var searchGamePlaying = false;
var checkGamePlaying = false;
var trackGamePlaying = false;
var arr =[10, 20];
var brr = [];  //打乱后的复杂度序列，如图形个数为10个、40个、30个、20个
var roundTotal = arr.length;
var round = 0;
var xNum = 3;	
var yNum = 2;	//将整个Canvas划分成2行3列共6个区域


function Shape(shape, x, y, color) { //图形类
	this.shape = shape;
	this.x = x;
	this.y = y;
	this.color = color;
	this.originColor = color;
	this.getMyArea = function() {
		var xLen = W/xNum;
		var yLen = H/yNum;
		for(var i = 0; i < xNum; i++) {
			for(var j = 0; j < yNum; j++) {
				if(i*xLen < this.x && this.x < (i+1)*xLen && 
				   j*yLen < this.y && this.y < (j+1)*yLen) {
					   return i + j*xNum + 1;
				   }
			}
		}
	}
	this.getMyArea();
	this.drawMyself = function(){
		if (!this.hide) {
			if (this.shape == "Circle") {
				drawCircle(this.x, this.y, this.color);
			} else if (this.shape == "Square") {
				drawSquare(this.x, this.y, this.color);
			} else {
				drawTriangle(this.x, this.y, this.color);
			}
		}
	}
	this.isClickedOn = function(clickX, clickY) { //返回点击位置(clickX, clickY)是否点中了本图形
		var dist = distance(this.x, this.y, clickX, clickY);
		if (dist < 1.5 * R) return true;
		else return false;
	}
	this.changeMyColor = function() {
		while(true) {
			var newColor = COLORS[(Math.floor(Math.random()*COLORS.length))];
			if (newColor != this.color) {
				this.color = newColor;
				break;
			}
		}
	}
	this.changeBackMyColor = function() {
		this.color = this.originColor;
	}
}

function drawCircle(x, y, color) { //圆心坐标(x, y)，半径R，颜色color
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.arc(x, y, R, 0, 2*Math.PI);
	ctx.stroke();
}

function drawSquare(x, y, color) { //中心坐标(x, y)，边长1.8R，颜色color
	ctx.strokeStyle = color;
	ctx.strokeRect(x-0.9*R, y-0.9*R, 1.8*R, 1.8*R);
}

function drawTriangle(x, y, color) { //中心坐标(x, y)，边长1.732R，颜色color
	ctx.strokeStyle = color;
	var r = 1 * R;
	var L = 2 * r * Math.sin(Math.PI / 3);
	ctx.beginPath();
	ctx.moveTo(x, y-r);
	ctx.lineTo(x-L/2, y+r/2);
	ctx.lineTo(x+L/2, y+r/2);
	ctx.lineTo(x, y-r);
	ctx.stroke();
}

function randomShape() {
	var coin = Math.random();
	if (coin < 0.333) {
		return 'Circle';
	} else if (coin < 0.667) {
		return 'Square';
	} else {
		return 'Triangle';
	}
}

function distance(x1, y1, x2, y2) {
	var dx = x1 - x2;
	var dy = y1 - y2;
	var dist = Math.sqrt(dx * dx + dy * dy);
	return dist;
}

function checkPosition(x, y) { //检查位置(x,y)是否可以画一个图形，否->返回false
	if (x < 2*R || x > W-2*R || y < 2*R || y > H-2*R) return false; //离边界太近
	//if (x > W * 2 / 3 && y < H / 4) return false;
	if (Math.abs(x - W/3) < 2*R || Math.abs(x - W*2/3) < 2*R || Math.abs(y - H/2) < 2*R) return false; //离区域分界线太近
	for (var i = 0; i < shapes.length; i++) {
		var dist = distance(x, y, shapes[i].x, shapes[i].y);
		if (dist < 3 * R) return false;
	}
	return true;
}

function drawRandomly(n) { //在当前画布基础上随机（位置、颜色、形状都随机）画n个图形
	//shapes = [];
	for (var i = 0; i < n; i++) {
		var x = (Math.floor(Math.random()*W));
		var y = (Math.floor(Math.random()*H));
		if (!checkPosition(x, y)) {
			i -= 1;
			continue;
		}
		var color = COLORS[(Math.floor(Math.random()*COLORS.length))];
		var shape = randomShape();
		var newOne = new Shape(shape, x, y, color);
		newOne.drawMyself();
		shapes[shapes.length] = newOne;
	}
}

function drawAllShapes() { //绘制shapes数组里的所有图形
	
	for (var i = 0; i < shapes.length; i++) {
		shapes[i].drawMyself();
	}
}

function clearCanvas() { //清空画布，【但不动shapes数组】
	c.height = c.height;
	ctx.lineWidth = 3;
}


//************************* 游戏辅助函数 ************************* 

function whoIsClicked(x, y) {
	for (var i = 0; i < shapes.length; i++) {
		if (shapes[i].isClickedOn(x, y)) {
			return i;
		}
	}
	return 999;
}

function reDraw() {
	clearCanvas();
	drawAllShapes();
	if (checkGamePlaying) {
		drawBoarders();
	}
}

/*******************************
 *        Discover Game        *
 *******************************/
function addOneShape() {
	drawRandomly(1);
	noReactionTimeout = setTimeout("whenTimeIsUp();", TIME_THRESHOLD);
}

function removeOneShape(x) {
	shapes.splice(x, 1);
	reDraw();
}

function startAppearringOne() { //开始等待增画一个图形
	startTime = new Date().getTime();
	appearDelay = Math.random()*4500+500;
	clearTimeout(noReactionTimeout);
	setTimeout("addOneShape();", appearDelay);
}

function endOfRound() {  //当一轮DiscoverGame结束时
	clearTimeout(noReactionTimeout);
	console.log("hitsList:", hitsList);
	alert("Discover Round"+(round+1)+" Finished!");
	discoverRoundOver = true;
}

function whenTimeIsUp() {  //当被试超过规定时限未点击新增图形时的操作
	console.log("Missed Discovering! Reaction Time: " + TIME_THRESHOLD + "ms");
	hitsList[hitsList.length] = TIME_THRESHOLD;
	removeOneShape(INIT_NUM);
	if (++testCount < EACH_ROUND) {
		startAppearringOne();
	} else {
		endOfRound();
	}
}


/*******************************
 *        Perceive Game        *
 *******************************/
 
function changeOneColor() {
	whoseColorIsChanged = Math.floor(Math.random()*INIT_NUM);
	shapes[whoseColorIsChanged].changeMyColor();
	reDraw();
	noReactionTimeout2 = setTimeout("whenTimeIsUp2();", TIME_THRESHOLD2);
}

function changeBackOneColor(x) {
	shapes[x].changeBackMyColor();
	reDraw();
}
 
function startColoringOne() { //开始等待改变一个图形的颜色
	startTime2 = new Date().getTime();
	appearDelay2 = Math.random()*4500+500;
	clearTimeout(noReactionTimeout2);
	setTimeout("changeOneColor();", appearDelay2);
}

function endOfRound2() {
	clearTimeout(noReactionTimeout2);
	console.log("hitsList2:", hitsList2);
	alert("Perceive Round"+(round+1)+" Finished!");
	perceiveRoundOver = true;
}

function whenTimeIsUp2() {
	console.log("Missed Perceiving! Reaction Time2: " + TIME_THRESHOLD2 + "ms");
	hitsList2[hitsList2.length] = TIME_THRESHOLD2;
	changeBackOneColor(whoseColorIsChanged);
	whoseColorIsChanged = -1;
	if (++testCount2 < EACH_ROUND) {
		startColoringOne();
	} else {
		endOfRound2();
	}
}

/*******************************
 *         Search Game         *
 *******************************/

function colorCount(color) {
	var count = 0;
	for(var i = 0; i < shapes.length; i++) {
		if(shapes[i].originColor == color) {
			count++;
		}
	}
	return count;
}

function shapeCount(shape) {
	var count = 0;
	for(var i = 0; i < INIT_NUM; i++) {
		if(shapes[i].shape == shape) {
			count++;
		}
	}
	return count;
}

function randomQuestionAndAnswersThenShowThem() { //若随机到了出现过的问题，需要重新随机
	var askColorOrShape = Math.floor(Math.random()*2);
	if (askColorOrShape == 0) {
		var which_color = Math.floor(Math.random()*COLORS.length);
		var color_name = COLOR_NAMES[which_color];
		var color = COLORS[which_color];
		question = "How many " + color_name + " shapes you can see?";
		answer = colorCount(color);
	} else {
		var shape = randomShape();
		question = "How many " + shape + "s you can see?";
		answer = shapeCount(shape);
	}
	for (var k = 0; k < questionList.length; k++) {
		if (questionList[k] == question) {
			randomQuestionAndAnswersThenShowThem();
			return;
		}
	}
	questionList[questionList.length] = question;
	var answers = [answer-2, answer-1, answer, answer+1, answer+2];
	var delta = Math.floor(Math.random()*5)-2;
	for (var j = 0; j < answers.length; j++) { //答案平移
		answers[j] += delta;
	}
	if(answers[0] < 0) {	//特殊情况
		for (var j = 0; j < answers.length; j++) {
			answers[j] = j;
		}
	}
	for (var j = 0; j < answers.length; j++) { //answerOption
		if(answers[j]==answer) {
			answerOption = j+1; 
			break;
		}
	}
	//"ShowThem"
	for (var j = 0; j < 5; j++) {
		options[j].innerHTML = answers[j];
	}
	info.innerHTML = question;
	//计时
	startTime3 = new Date().getTime();
	clearTimeout(noReactionTimeout3);
	noReactionTimeout3 = setTimeout("whenTimeIsUp3();", TIME_THRESHOLD3);
}

function whenTimeIsUp3() {
	console.log("Missed Options! Reaction Time3: " + TIME_THRESHOLD3 + "ms");
	alert("You've Missed One Question!");
	hitsList3[hitsList3.length] = TIME_THRESHOLD3;
	if (++testCount3 < EACH_ROUND3) {
		randomQuestionAndAnswersThenShowThem();
	} else {
		endOfRound3();
	}
}

function endOfRound3() {
	clearTimeout(noReactionTimeout3);
	console.log("hitsList3:", hitsList3);
	alert("Search Round"+(round+1)+" Finished!");
	searchRoundOver = true;
}

function doWhenOpt(num) {
	var hitTime3 = new Date().getTime();
	var reactionTime3 = hitTime3 - startTime3;
	if(answerOption==num) {
		console.log("Correct Option! Reaction Time3: " + reactionTime3.toString() + "ms");
		hitsList3[hitsList3.length] = reactionTime3;
	} else {
		console.log("Wrong Option! Reaction Time3: " + reactionTime3.toString() + "ms");
		hitsList3[hitsList3.length] = -reactionTime3;
	}
	if (++testCount3 < EACH_ROUND3) {
		randomQuestionAndAnswersThenShowThem();
	} else {
		endOfRound3();
	}
}

function opt1() { doWhenOpt(1); }
function opt2() { doWhenOpt(2); }
function opt3() { doWhenOpt(3); }
function opt4() { doWhenOpt(4); }
function opt5() { doWhenOpt(5); }



//************************* 游戏主体 *************************


/*******************************
 *        Discover Game        *
 *******************************/
var hitsList = [];
var startTime = new Date().getTime();
var appearDelay;
var testCount = 0;
var noReactionTimeout = undefined;
var TIME_THRESHOLD = 5000;
var testInterval = undefined;
var discoverRoundOver = false;


function playDiscoverGame() {
	discoverGamePlaying = true;
	
	startAppearringOne();
	
	c.addEventListener('click', function(e){
		var x = e.offsetX;
		var y = e.offsetY;
		var clickedI = whoIsClicked(x, y);
		if (clickedI == INIT_NUM) { //点中了刚出现的图形
			var hitTime = new Date().getTime();
			var reactionTime = hitTime - startTime - appearDelay;
			console.log("You've Discovered it! Reaction Time: " + reactionTime.toString() + "ms");
			hitsList[hitsList.length] = reactionTime;
			removeOneShape(clickedI);
			if (++testCount < EACH_ROUND) {
				startAppearringOne();
			} else {
				endOfRound();
			}
		}
	});	
}

/*******************************
 *        Perceive Game        *
 *******************************/

var whoseColorIsChanged = -1;
var hitsList2 = [];
var startTime2 = new Date().getTime();
var appearDelay2;
var testCount2 = 0;
var noReactionTimeout2 = undefined;
var TIME_THRESHOLD2 = 5000;
var perceiveRoundOver = false;

 
function playPerceiveGame() {
	perceiveGamePlaying = true;
	
	startColoringOne();
	
	c.addEventListener('click', function(e){
		var x = e.offsetX;
		var y = e.offsetY;
		var clickedI = whoIsClicked(x, y);
		if (clickedI == whoseColorIsChanged) { //点中了刚改变颜色的图形
			var hitTime2 = new Date().getTime();
			var reactionTime2 = hitTime2 - startTime2 - appearDelay2;
			console.log("You've Perceived it! Reaction Time2: " + reactionTime2.toString() + "ms");
			hitsList2[hitsList2.length] = reactionTime2;
			changeBackOneColor(whoseColorIsChanged);
			whoseColorIsChanged = -1;
			if (++testCount2 < EACH_ROUND) {
				startColoringOne();
			} else {
				endOfRound2();
			}
		}
	});	
}

/*******************************
 *         Search Game         *
 *******************************/
 
var option1 = document.getElementById("option1");
var option2 = document.getElementById("option2");
var option3 = document.getElementById("option3");
var option4 = document.getElementById("option4");
var option5 = document.getElementById("option5");
var options = [option1, option2, option3, option4, option5];
var info = document.getElementById("info");
for (var i = 0; i < 5; i++) {
	options[i].style.display="none";
}
var question = "";
var answer = -333;	//正确答案的值
var answers = [];	//5个选项
var answerOption = -3333; 	//记录正确答案是哪一个选项（1~5）
var questionList = [];		//记录该轮的所有问题
var hitsList3 = [];
var startTime3 = new Date().getTime();
var testCount3 = 0;
var noReactionTimeout3 = undefined;
var TIME_THRESHOLD3 = 1000000;
var searchRoundOver = false;

 
function playSearchGame() {
	searchGamePlaying = true;
	for (var i = 0; i < 5; i++) {
		options[i].style.display="block";
	}
	randomQuestionAndAnswersThenShowThem();
}
 
 
/*******************************
 *         Check Game          *
 *******************************/

var checkboxes = document.getElementsByName("test");
document.getElementById("checkGameInputs").style.display = "none";
var moreThanX = -4444;  //提问中多于X个shapes
var hitsList4 = [];
var accuracyList = [];
var startTime4 = new Date().getTime();
var checkRoundOver = false;

 
function drawBoarders() { //(3,2)
	var xLen = W/xNum;
	var yLen = H/yNum;
	ctx.strokeStyle = WHITE;
	for(var i = 0; i < xNum; i++) {
		var x = i * xLen;
		for(var j = 0; j < yNum; j++) {
			var y = j * yLen;
			ctx.strokeRect(x, y, xLen, yLen);
		}
	}
}

function totalEachArea() {
	var totals = [];
	for(var n = 0; n < xNum*yNum; n++) totals[n] = 0;
	for(var i = 0; i < shapes.length; i++) {
		totals[shapes[i].getMyArea()-1] ++;
	}
	return totals;
}

function doWhenCheckGameSubmit() {
	var checkValues = [];
    for(k in checkboxes){
        if(checkboxes[k].checked)
            checkValues.push(checkboxes[k].value);
    }
	var totals = totalEachArea();
	var correctValues = [];
	for(var k = 0; k < xNum*yNum; k++) {
		if(totals[k] > moreThanX) {
			correctValues.push(k+1);
		}
	}
	var correctCount = 0;
	for(var areaNum = 1; areaNum <= xNum*yNum; areaNum++) {
		var userAns = checkValues.contains(areaNum);
		var correctAns = correctValues.contains(areaNum);
		if(!(userAns ^ correctAns)) { //对于该区域回答正确
			correctCount++;
		}
	}
	accuracyList.push(correctCount/(xNum*yNum));
	var hitTime4 = new Date().getTime();
	var reactionTime4 = hitTime4 - startTime4;
	console.log("Check Round"+(round+1)+" Finished! Reaction Time4: " + reactionTime4.toString() + "ms");
	alert("Check Round"+(round+1)+" Finished!");
	hitsList4[hitsList4.length] = reactionTime4;
	checkRoundOver = true;
}
 
function startCheckGame() {
	drawBoarders();
	moreThanX = Math.floor(INIT_NUM / 6).toString();
	info.innerHTML = "Choose areas with MORE THAN " + moreThanX + " shapes:";
	startTime4 = new Date().getTime();
}
 
function playCheckGame() {
	checkGamePlaying = true;
	document.getElementById("checkGameInputs").style.display = "block";
	startCheckGame();
}
 
 

function nextRound() {
	var u1 = false;
	var u2 = false;
	var u3 = false;
	var u4 = false;
	if (!discoverGamePlaying) u1 = true;
	if (!perceiveGamePlaying) u2 = true;
	if (!searchGamePlaying) u3 = true;
	if (!checkGamePlaying) u4 = true;
	if (discoverGamePlaying && discoverRoundOver) u1 = true;
	if (perceiveGamePlaying && perceiveRoundOver) u2 = true;
	if (searchGamePlaying && searchRoundOver) u3 = true;
	if (checkGamePlaying && checkRoundOver) u4 = true;
	if (u1 && u2 && u3 && u4) {
		console.log("next round!");
		if (++round < roundTotal) {
			INIT_NUM = brr[round];
			shapes = [];
			clearCanvas();
			drawRandomly(INIT_NUM);
			console.log(shapes);
			if (discoverGamePlaying) {
				testCount = 0;
				hitsList = [];
				startAppearringOne();
				discoverRoundOver = false;
			}
			if (perceiveGamePlaying) {
				testCount2 = 0;
				hitsList2 = [];
				startColoringOne();
				perceiveRoundOver = false;
			}
			if (searchGamePlaying) {
				testCount3 = 0;
				hitsList3 = [];
				questionList = [];
				randomQuestionAndAnswersThenShowThem();
				searchRoundOver = false;
			}
			if (checkGamePlaying) {
				for(k in checkboxes){
					checkboxes[k].checked = false;
				}
				startCheckGame();
				checkRoundOver = false;
			}
		} else {
			alert("Mission Complete!");
			if (checkGamePlaying) {
				console.log("hitsList4:", hitsList4);
				console.log("accuracyList:", accuracyList);
			}
		}
	}
}


function init() {
	c.height = c.height;
	ctx.lineWidth = 3;
	console.log(W, H);
	for (var i = 0; i < roundTotal; i++){
		var temp = parseInt(Math.random()*(roundTotal-i));
		brr.push(arr[temp]);
		arr.splice(temp,1);
	}
	console.log(brr);
	INIT_NUM = brr[round];
	drawRandomly(INIT_NUM); 
	console.log(shapes);
	document.getElementById("nextRound").removeAttribute("disabled");
	document.getElementById("startGame").setAttribute("disabled", true);
}


function letsPlay() {
	init();
	playDiscoverGame();
	//playPerceiveGame();
	//playSearchGame();
	playCheckGame();
}


//letsPlay();

