

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
//画形状用的全局变量
var W = 1300; //document.body.clientWidth;
var H = 700;  //document.body.clientHeight;
var R = 20;   //圆形的半径，以确定各图形的大小
var RED = 'rgb(255,0,0)';
var BLUE = 'rgb(0,255,255)';
var YELLOW = 'rgb(255,255,0)';
var GREEN = 'rgb(0,255,0)';
var COLORS = [RED, BLUE, YELLOW, GREEN];
var shapes = [];  //形状的对象数组
//游戏开关
var INIT_NUM = 10;  //初始复杂度
var EACH_ROUND = 10;  //每种复杂度算一轮，一轮做10次实验
var discoverGamePlaying = false;
var colorGamePlaying = false;


function Shape(shape, x, y, color) { //图形类
	this.shape = shape;
	this.x = x;
	this.y = y;
	this.color = color;
	this.hide = false;	//为true时隐藏该shape
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

function checkPosition(x, y) { //检查位置(x,y)是否符合要求，否->返回false
	if (x < 2*R || x > W-2*R || y < 2*R || y > H-2*R) return false;
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
	return -1;
}

function addOneShape() {
	drawRandomly(1);
	noReactionTimeout = setTimeout("whenTimeIsUp();", 5000);
}

function removeOneShape(x) {
	shapes.splice(x, 1);
	clearCanvas();
	drawAllShapes();
}

function startAppearringOne() { //开始等待增画一个图形
	startTime = new Date().getTime();
	appearDelay = Math.random()*2500+500;
	clearTimeout(noReactionTimeout);
	setTimeout("addOneShape();", appearDelay);
}

function endOfRound() {  //当一轮DiscoverGame结束时
	clearTimeout(noReactionTimeout);
	if (++round < roundTotal) {
		INIT_NUM = brr[round];
		testCount = 0;
		clearCanvas();
		shapes = [];
		console.log(hitsList);
		hitsList = [];
		drawRandomly(INIT_NUM); 
		console.log(shapes);
		startAppearringOne();
	} else {
		alert("Finished Discovering Game!");
	}
}

function whenTimeIsUp() {  //当被试超过规定时限未点击新增图形时的操作
	console.log("Reaction Time: 5000ms");
	hitsList[hitsList.length] = 0;
	removeOneShape(shapes.length-1);
	if (++testCount < EACH_ROUND) {
		startAppearringOne();
	} else {
		endOfRound();
	}
}


//************************* 游戏主体 *************************

var hitsList = [];
var startTime = new Date().getTime();
var appearDelay;
var testCount = 0;
var noReactionTimeout = undefined;
var round = 0;
var arr =[10, 20];
var brr = [];  //打乱后的复杂度序列，如图形个数为10个、40个、30个、20个
var roundTotal = arr.length;


function playDiscoverGame() {
	discoverGamePlaying = true;
	
	startAppearringOne();
	
	c.addEventListener('click', function(e){
		var x = e.offsetX;
		var y = e.offsetY;
		var clickedI = whoIsClicked(x, y);
		if (clickedI == INIT_NUM) { //点中了刚出现的图形
			hitsList[hitsList.length] = 1;
			var hitTime = new Date().getTime();
			var reactionTime = hitTime - startTime - appearDelay;
			console.log("Reaction Time: " + reactionTime.toString() + "ms");
			removeOneShape(clickedI);
			if (++testCount < EACH_ROUND) {
				startAppearringOne();
			} else {
				endOfRound();
			}
		}
	});
	
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
}


function letsPlay() {
	init();
	playDiscoverGame();
}


letsPlay();

