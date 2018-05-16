

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var R = 20;  //圆形的半径，以确定各图形的大小
var RED = 'rgb(255,0,0)';
var BLUE = 'rgb(0,255,255)';
var YELLOW = 'rgb(255,255,0)';
var GREEN = 'rgb(0,255,0)';

function init() {
	ctx.lineWidth = 3;
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
	
	/*var dig = Math.PI / n * 4;
	for(var i = 0; i < n; i++)
	{
		var x = Math.sin(i * dig);
		var y = Math.cos(i * dig);
		ctx.lineTo(x * size + dx, y * size + dy);
	}*/
	ctx.stroke();
}



init();
drawCircle(100, 100, BLUE);
drawTriangle(200, 100, YELLOW);
drawCircle(300, 100, GREEN);
drawSquare(400, 100, RED);
