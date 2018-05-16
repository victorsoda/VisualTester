

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
var shapes = [];

function Shape(shape, x, y, color) {
	this.shape = shape;
	this.x = x;
	this.y = y;
	this.color = color;
	this.drawMyself = function(){
		if (this.shape == "Circle") {
			drawCircle(this.x, this.y, this.color);
		} else if (this.shape == "Square") {
			drawSquare(this.x, this.y, this.color);
		} else {
			drawTriangle(this.x, this.y, this.color);
		}
	}
}

function init() {
	ctx.lineWidth = 3;
	console.log(W, H);
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

function checkPosition(x, y) { //检查位置(x,y)是否符合要求，否->返回false
	if (x < 2*R || x > W-2*R || y < 2*R || y > H-2*R) return false;
	for (var i = 0; i < shapes.length; i++) {
		var dx = x - shapes[i].x;
		var dy = y - shapes[i].y;
		var dist = Math.sqrt(dx * dx + dy * dy);
		if (dist < 3 * R) return false;
	}
	return true;
}

function drawRandomly(n) {
	shapes = [];
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

init();
drawRandomly(10);
console.log(shapes);

