Array.prototype.contains = function ( needle ) {
  for (i in this) {
    if (this[i] == needle) return true;
  }
  return false;
}
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o){
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
    }
    return fmt;
}
/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 1.3.2
 * 2016-06-16 18:25:19
 *
 * By Eli Grey, http://eligrey.com
 * License: MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */
 
/*global self */
/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */
 
/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
 
var saveAs = saveAs || (function(view) {
    "use strict";
    // IE <10 is explicitly unsupported
    if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
        return;
    }
    var
          doc = view.document
          // only get URL when necessary in case Blob.js hasn't overridden it yet
        , get_URL = function() {
            return view.URL || view.webkitURL || view;
        }
        , save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
        , can_use_save_link = "download" in save_link
        , click = function(node) {
            var event = new MouseEvent("click");
            node.dispatchEvent(event);
        }
        , is_safari = /constructor/i.test(view.HTMLElement) || view.safari
        , is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent)
        , throw_outside = function(ex) {
            (view.setImmediate || view.setTimeout)(function() {
                throw ex;
            }, 0);
        }
        , force_saveable_type = "application/octet-stream"
        // the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
        , arbitrary_revoke_timeout = 1000 * 40 // in ms
        , revoke = function(file) {
            var revoker = function() {
                if (typeof file === "string") { // file is an object URL
                    get_URL().revokeObjectURL(file);
                } else { // file is a File
                    file.remove();
                }
            };
            setTimeout(revoker, arbitrary_revoke_timeout);
        }
        , dispatch = function(filesaver, event_types, event) {
            event_types = [].concat(event_types);
            var i = event_types.length;
            while (i--) {
                var listener = filesaver["on" + event_types[i]];
                if (typeof listener === "function") {
                    try {
                        listener.call(filesaver, event || filesaver);
                    } catch (ex) {
                        throw_outside(ex);
                    }
                }
            }
        }
        , auto_bom = function(blob) {
            // prepend BOM for UTF-8 XML and text/* types (including HTML)
            // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
            if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
                return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
            }
            return blob;
        }
        , FileSaver = function(blob, name, no_auto_bom) {
            if (!no_auto_bom) {
                blob = auto_bom(blob);
            }
            // First try a.download, then web filesystem, then object URLs
            var
                  filesaver = this
                , type = blob.type
                , force = type === force_saveable_type
                , object_url
                , dispatch_all = function() {
                    dispatch(filesaver, "writestart progress write writeend".split(" "));
                }
                // on any filesys errors revert to saving with object URLs
                , fs_error = function() {
                    if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
                        // Safari doesn't allow downloading of blob urls
                        var reader = new FileReader();
                        reader.onloadend = function() {
                            var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
                            var popup = view.open(url, '_blank');
                            if(!popup) view.location.href = url;
                            url=undefined; // release reference before dispatching
                            filesaver.readyState = filesaver.DONE;
                            dispatch_all();
                        };
                        reader.readAsDataURL(blob);
                        filesaver.readyState = filesaver.INIT;
                        return;
                    }
                    // don't create more object URLs than needed
                    if (!object_url) {
                        object_url = get_URL().createObjectURL(blob);
                    }
                    if (force) {
                        view.location.href = object_url;
                    } else {
                        var opened = view.open(object_url, "_blank");
                        if (!opened) {
                            // Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
                            view.location.href = object_url;
                        }
                    }
                    filesaver.readyState = filesaver.DONE;
                    dispatch_all();
                    revoke(object_url);
                }
            ;
            filesaver.readyState = filesaver.INIT;
 
            if (can_use_save_link) {
                object_url = get_URL().createObjectURL(blob);
                setTimeout(function() {
                    save_link.href = object_url;
                    save_link.download = name;
                    click(save_link);
                    dispatch_all();
                    revoke(object_url);
                    filesaver.readyState = filesaver.DONE;
                });
                return;
            }
 
            fs_error();
        }
        , FS_proto = FileSaver.prototype
        , saveAs = function(blob, name, no_auto_bom) {
            return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
        }
    ;
    // IE 10+ (native saveAs)
    if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
        return function(blob, name, no_auto_bom) {
            name = name || blob.name || "download";
 
            if (!no_auto_bom) {
                blob = auto_bom(blob);
            }
            return navigator.msSaveOrOpenBlob(blob, name);
        };
    }
 
    FS_proto.abort = function(){};
    FS_proto.readyState = FS_proto.INIT = 0;
    FS_proto.WRITING = 1;
    FS_proto.DONE = 2;
 
    FS_proto.error =
    FS_proto.onwritestart =
    FS_proto.onprogress =
    FS_proto.onwrite =
    FS_proto.onabort =
    FS_proto.onerror =
    FS_proto.onwriteend =
        null;
 
    return saveAs;
}(
       typeof self !== "undefined" && self
    || typeof window !== "undefined" && window
    || this.content
));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window
 
if (typeof module !== "undefined" && module.exports) {
  module.exports.saveAs = saveAs;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd !== null)) {
  define("FileSaver.js", function() {
    return saveAs;
  });
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
var PURPLE = 'rgb(255,0,255)';
var COLORS = [RED, BLUE, YELLOW, GREEN];
var COLOR_NAMES = ["RED", "BLUE", "YELLOW", "GREEN"];
var shapes = [];  //形状的对象数组
//游戏全局变量
var INIT_NUM = 10;  //初始复杂度
var EACH_ROUND = 10;  //每种复杂度算一轮，一轮做10次实验
var EACH_ROUND3 = 5;	//每轮提3个问题，必须<=7
var DetectGamePlaying = false;
var DiscriminateGamePlaying = false;
var searchGamePlaying = false;
var checkGamePlaying = false;
var trackGamePlaying = false;
var arr =[15];
var brr = [];  //打乱后的复杂度序列，如图形个数为10个、40个、30个、20个
var roundTotal = -100;
var round = 0;
var xNum = 3;	
var yNum = 2;	//将整个Canvas划分成2行3列共6个区域
var writeStr = "";
var fileName = "";
var gameName = "";
var studentID = "";
var needToRecordStartAndEndTime = false;


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
	this.crushWithShape = function(s) {	//仅限于本形状为圆形（任务5紫色小球）
		if(s.shape == 'Circle') {
			var dist = distance(this.x, this.y, s.x, s.y);
			if (dist <= 2*R) return true;
			else return false;	
		} else if (s.shape == 'Square') {
			var x1 = s.x - 0.9*R;
			var x2 = s.x + 0.9*R;
			var y1 = s.y - 0.9*R;
			var y2 = s.y + 0.9*R;
			if (Math.abs(this.x - x1) < R && y1 < this.y && this.y < y2) return true;
			if (Math.abs(this.x - x2) < R && y1 < this.y && this.y < y2) return true;
			if (Math.abs(this.y - y1) < R && x1 < this.x && this.x < x2) return true;
			if (Math.abs(this.y - y2) < R && x1 < this.x && this.x < x2) return true;
			return false;
		} else {
			var L = 2 * R * Math.sin(Math.PI / 3);
			var x1 = s.x, y1 = s.y-R;
			var x2 = s.x-L/2, y2 = s.y+R/2;
			var x3 = s.x+L/2, y3 = s.y+R/2;
			var distA = distance(this.x, this.y, x1, y1);
			var distB = distance(this.x, this.y, x2, y2);
			var distC = distance(this.x, this.y, x3, y3);
			if (distA < R || distB < R || distC < R) return true;
			//TODO: ......
			return false;
		}
			
		
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
		if (dist < 5 * R) return false;
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

function writeList(l, listName) {
	writeStr += listName + ",";
	for (var i = 0; i < l.length-1; i++) {
		writeStr += l[i].toString();
		writeStr += ",";
	}
	writeStr += l[l.length-1].toString();
	writeStr += " \r\n ";
}

/*******************************
 *        Detect Game        *
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

function endOfRound() {  //当一轮DetectGame结束时
	clearTimeout(noReactionTimeout);
	console.log("hitsList:", hitsList);
	writeList(hitsList, "hitsList");
	//alert("Detect Round"+(round+1)+" Finished!");
	DetectRoundOver = true;
}

function whenTimeIsUp() {  //当被试超过规定时限未点击新增图形时的操作
	console.log("Missed Detecting! Reaction Time: " + TIME_THRESHOLD + "ms");
	hitsList[hitsList.length] = TIME_THRESHOLD;
	removeOneShape(INIT_NUM);
	if (++testCount < EACH_ROUND) {
		startAppearringOne();
	} else {
		endOfRound();
	}
}


/*******************************
 *        Discriminate Game        *
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
	writeList(hitsList2, "hitsList2");
	//alert("Discriminate Round"+(round+1)+" Finished!");
	DiscriminateRoundOver = true;
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
	//alert("You've Missed One Question!");
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
	writeList(hitsList3, "hitsList3");
	//alert("Search Round"+(round+1)+" Finished!");
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

/*******************************
 *          Check Game         *
 *******************************/

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
	//alert("Check Round"+(round+1)+" Finished!");
	hitsList4[hitsList4.length] = reactionTime4;
	writeList(hitsList4, "hitsList4");
	writeList(accuracyList, "accuracyList4");
	hitsList4 = [];
	accuracyList = [];
	checkRoundOver = true;
}
 
function startCheckGame() {
	drawBoarders();
	moreThanX = Math.floor(INIT_NUM / 6).toString();
	info.innerHTML = "Choose areas with MORE THAN " + moreThanX + " shapes:";
	startTime4 = new Date().getTime();
}

/*******************************
 *          Track Game         *
 *******************************/

function endOfRound5() {
	//alert("Track Round"+(round+1)+" Finished!");
	console.log("hitsList5:", hitsList5);
	writeList(hitsList5, "hitsList5");
	trackRoundOver = true;
}
 
function whenTimeIsUp5(sub) {
	console.log("Missed Tracking! Reaction Time5: " + TIME_THRESHOLD5 + "ms");
	hitsList5[sub] = TIME_THRESHOLD5;
	isTimeOutList[sub] = true;
	if(crushList.length == 10 && !isTimeOutList.contains(false)) { //游戏结束
		endOfRound5();
	}
} 
 
function randomNum(num1,num2){  
	return Math.random()*(num2-num1)+num1;  
}  

function knightMove() {	
	var coin = randomNum(-6, 6) * Math.PI / 180;
	theta += coin;
	
	if (knight.x > W-R || knight.x < R) {
		theta = Math.PI - theta;
	}
	if (knight.y > H-R || knight.y < R) {
		theta = -theta;
	}
	knight.x += v * Math.cos(theta);
	knight.y += v * Math.sin(theta);
	
	reDraw();
	knight.drawMyself();
	var flag = false;
	for(var i = 0; i < INIT_NUM; i++) {
		if (knight.crushWithShape(shapes[i])) {
			flag = true;
			if (crushList.length != 0 && crushWho == i) { //短时间内重复碰撞同一形状，说明还是同一次碰撞
				return;
			} else { //骑士小球撞到了一个图形
				crushWho = i;
				crushList.push(i);
				//console.log(crushList);
				info5.innerHTML = "Track Count: "+trackCount;
				var timeout = setTimeout("whenTimeIsUp5("+(crushList.length-1)+");", TIME_THRESHOLD5);
				timeoutList.push(timeout);
				isTimeOutList.push(false);
				startTimeList.push(new Date().getTime());
				if(crushList.length == 10) {	//骑士小球撞到第10个图形时停止
					clearInterval(moveInterval);
					setTimeout("reDraw();", 500);
				}
			}
		}
	}
	if(!flag) {
		crushWho = -1;
	}
}


//************************* 游戏主体 *************************


/*******************************
 *        Detect Game        *
 *******************************/
var hitsList = [];
var startTime = new Date().getTime();
var appearDelay;
var testCount = 0;
var noReactionTimeout = undefined;
var TIME_THRESHOLD = 5000;
var testInterval = undefined;
var DetectRoundOver = false;


function playDetectGame() {
	DetectGamePlaying = true;
	
	startAppearringOne();
	
	c.addEventListener('click', function(e){
		var x = e.offsetX;
		var y = e.offsetY;
		var clickedI = whoIsClicked(x, y);
		if (clickedI == INIT_NUM) { //点中了刚出现的图形
			var hitTime = new Date().getTime();
			var reactionTime = hitTime - startTime - appearDelay;
			console.log("You've Detected it! Reaction Time: " + reactionTime.toString() + "ms");
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
 *        Discriminate Game        *
 *******************************/

var whoseColorIsChanged = -1;
var hitsList2 = [];
var startTime2 = new Date().getTime();
var appearDelay2;
var testCount2 = 0;
var noReactionTimeout2 = undefined;
var TIME_THRESHOLD2 = 5000;
var DiscriminateRoundOver = false;

 
function playDiscriminateGame() {
	DiscriminateGamePlaying = true;
	
	startColoringOne();
	
	c.addEventListener('click', function(e){
		var x = e.offsetX;
		var y = e.offsetY;
		var clickedI = whoIsClicked(x, y);
		if (clickedI == whoseColorIsChanged) { //点中了刚改变颜色的图形
			var hitTime2 = new Date().getTime();
			var reactionTime2 = hitTime2 - startTime2 - appearDelay2;
			console.log("You've Discriminated it! Reaction Time2: " + reactionTime2.toString() + "ms");
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
var moreThanX = -4444;  //提问中多于X个shapes
var hitsList4 = [];
var accuracyList = [];
var startTime4 = new Date().getTime();
var checkRoundOver = false;

function playCheckGame() {
	checkGamePlaying = true;
	document.getElementById("checkGameInputs").style.display = "block";
	startCheckGame();
}
 
 
/*******************************
 *          Track Game         *
 *******************************/
 
var knight = new Shape('Circle', W/2, H/2, PURPLE);
var moveInterval = undefined;
var crushList = []; //存储每个被撞形状在shapes数组的下标
var timeoutList = [];  //存储每个被撞形状对应的setTimeout变量
var isTimeOutList = []; //记录该被撞形状是否确实超时了（或者被点中过了）
var crushWho = -1;
var TIME_THRESHOLD5 = 5000;
var hitsList5 = [];
var startTimeList = [];
var trackRoundOver = false;
var trackCount = 0;
var theta = randomNum(0, 2 * Math.PI);
var v = 6;
var info5 = document.getElementById("info5");

 
 
function playTrackGame() {
	trackGamePlaying = true;
	knight.drawMyself();
	
	moveInterval = setInterval("knightMove();", 25);
	c.addEventListener('click', function(e){
		var x = e.offsetX;
		var y = e.offsetY;
		var clickedI = whoIsClicked(x, y);
		for (var i = 0; i < crushList.length; i++) {
			if(isTimeOutList[i]) continue;
			if(crushList[i] == clickedI) { //点中了被撞的图形
				var hitTime = new Date().getTime();
				var reactionTime = hitTime - startTimeList[i];
				console.log("Nice track! Reaction Time: " + reactionTime.toString() + "ms")
				trackCount++;
				info5.innerHTML = "Track Count: "+trackCount;
				hitsList5[i] = reactionTime;
				isTimeOutList[i] = true;
				clearTimeout(timeoutList[i]);
				if(crushList.length == 10 && !isTimeOutList.contains(false)) { //游戏结束
					endOfRound5();
				}
			}
		}
	});	
}

var nextRoundInterval = undefined;

function initDetectGame() {
	testCount = 0;
	hitsList = [];
	DetectRoundOver = false;
}

function initDiscriminateGame() {
	testCount2 = 0;
	hitsList2 = [];
	DiscriminateRoundOver = false;
}

function initSearchGame(duringRound) {
	testCount3 = 0;
	hitsList3 = [];
	questionList = [];
	searchRoundOver = false;
	if(!duringRound) {
		for (var i = 0; i < 5; i++) {
			options[i].style.display="none";
		}
	}
	info.innerHTML = "";
}

function initCheckGame(duringRound) {
	for(k in checkboxes){
		checkboxes[k].checked = false;
	}
	checkRoundOver = false;
	hitsList4 = [];
	accuracyList = [];
	info.innerHTML = "";
	if(!duringRound)
		document.getElementById("checkGameInputs").style.display = "none";
}

function initTrackGame() {
	crushList = [];
	hitsList5 = [];
	timeoutList = []; 
	isTimeOutList = []; 
	crushWho = -1;
	startTimeList = [];
	trackRoundOver = false;
	trackCount = 0;
	theta = randomNum(0, 2 * Math.PI);
	info5.innerHTML = "";
	knight.x = W/2;
	knight.y = H/2;
}

function nextRound() {
	var u1 = false;
	var u2 = false;
	var u3 = false;
	var u4 = false;
	var u5 = false;
	if (!DetectGamePlaying) u1 = true;
	if (!DiscriminateGamePlaying) u2 = true;
	if (!searchGamePlaying) u3 = true;
	if (!checkGamePlaying) u4 = true;
	if (!trackGamePlaying) u5 = true;
	if (DetectGamePlaying && DetectRoundOver) u1 = true;
	if (DiscriminateGamePlaying && DiscriminateRoundOver) u2 = true;
	if (searchGamePlaying && searchRoundOver) u3 = true;
	if (checkGamePlaying && checkRoundOver) u4 = true;
	if (trackGamePlaying && trackRoundOver) u5 = true;
	if (u1 && u2 && u3 && u4 && u5) {
		console.log("next round!");
		fileName = studentID+gameName+"_"+INIT_NUM+".txt"; //保留刚结束这轮的文件名
		if (++round < roundTotal) {
			INIT_NUM = brr[round];
			shapes = [];
			clearCanvas();
			drawRandomly(INIT_NUM);
			console.log(shapes);
			if (DetectGamePlaying) {
				initDetectGame();
				startAppearringOne();
			}
			if (DiscriminateGamePlaying) {
				initDiscriminateGame();
				startColoringOne();
			}
			if (searchGamePlaying) {
				initSearchGame(true);
				randomQuestionAndAnswersThenShowThem();
			}
			if (checkGamePlaying) {
				initCheckGame(true);
				startCheckGame();
			}
			if (trackGamePlaying) {
				initTrackGame();
				knight.drawMyself();
				moveInterval = setInterval("knightMove();", 25);
			}
		} else {
			alert("Mission Complete!");
			round--;
			/*if (checkGamePlaying) {
				console.log("hitsList4:", hitsList4);
				writeList(hitsList4, "hitsList4");
				console.log("accuracyList:", accuracyList);
				writeList(accuracyList, "accuracyList4");
			}*/
			clearInterval(nextRoundInterval);
			console.log("Cleared nextRoundInterval!");
			document.getElementById("startGame").removeAttribute("disabled");
		}
		
		if (writeStr.length != 0) {
			if (needToRecordStartAndEndTime) {
				var endGameTime = new Date();
				writeStr += "endTime,"+endGameTime.Format("yyyy-MM-dd hh:mm:ss.S")+"\r\n";
			}
			var file = new File([writeStr], fileName, { type: "text/plain;charset=utf-8" });
			saveAs(file);
			if (needToRecordStartAndEndTime) {
				startGameTime = new Date();
				writeStr = "startTime,"+startGameTime.Format("yyyy-MM-dd hh:mm:ss.S")+"\r\n";
			} else {
				writeStr = "";
			}
		}
	}
}

initDetectGame();
initDiscriminateGame();
initSearchGame(false);
initCheckGame(false);
initTrackGame();

function init() {
	shapes = [];
	DetectGamePlaying = false;
	DiscriminateGamePlaying = false;
	searchGamePlaying = false;
	checkGamePlaying = false;
	trackGamePlaying = false;
	//所有游戏初始化
	initDetectGame();
	initDiscriminateGame();
	initSearchGame(false);
	initCheckGame(false);
	initTrackGame();
	
	gameName = "";
	c.height = c.height; //重置Canvas
	ctx.lineWidth = 3;
	console.log(W, H);
	for (var i = 0; i < roundTotal; i++){
		var temp = parseInt(Math.random()*(roundTotal-i));
		brr.push(arr[temp]);
		arr.splice(temp,1);
	}
	//console.log(brr);
	INIT_NUM = brr[round];
	console.log("init num:", INIT_NUM);
	drawRandomly(INIT_NUM); 
	console.log(shapes);
	//document.getElementById("nextRound").removeAttribute("disabled");
	document.getElementById("startGame").setAttribute("disabled", true);
	nextRoundInterval = setInterval("nextRound();", 1000);
}

var startGameTime = new Date().getTime();

function letsPlay() {
	studentID = document.getElementById("studentID").value;
	if(studentID.length == 0) {
		alert("Pleaze input your student ID!");
		return;
	}
	initNumStr = document.getElementById("initNum").value;
	if(initNumStr.length == 0) {
		alert("Pleaze input Complexity!");
		return;
	}
	//console.log("initNumStr:", initNumStr);
	//console.log("split:", initNumStr.split(","));
	arr = initNumStr.split(",");
	roundTotal = arr.length;
	console.log("arr:", arr);
	//arr = [INIT_NUM];
	brr = [];
	var gameBoxes = document.getElementsByName("game");
	var checkValues = [];
	for(k in gameBoxes){
		if(gameBoxes[k].checked)
			checkValues.push(gameBoxes[k].value);
	}
	if(checkValues.length == 0) {
		alert("Pleaze choose some of the Games!");
		return;
	}
	if(checkValues.contains(3) && checkValues.contains(4)) {
		alert("You shouldn't play Search & Check Games at the same time!");
		return;
	}
	init();
	if (needToRecordStartAndEndTime) {
		startGameTime = new Date();
		writeStr = "startTime,"+startGameTime.Format("yyyy-MM-dd hh:mm:ss.S")+"\r\n";	
	}
	for (var i = 0; i < checkValues.length; i++) {
		if (checkValues[i] == 1) {
			playDetectGame();
			gameName += "_Detect";
		}
		if (checkValues[i] == 2) {
			playDiscriminateGame();
			gameName += "_Discriminate";
		}
		if (checkValues[i] == 3) {
			playSearchGame();
			gameName += "_Search";
		}
		if (checkValues[i] == 4) {
			playCheckGame();
			gameName += "_Check";
		}
		if (checkValues[i] == 5) {
			playTrackGame();
			gameName += "_Track";
		}
	}
	fileName = studentID+gameName+"_"+INIT_NUM+".txt";
}


//letsPlay();

