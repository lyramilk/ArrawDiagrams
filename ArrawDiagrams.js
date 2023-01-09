/*
* 绘制箭头图，支持鼠标拖动结点，支持鼠标拖动箭头修改关联关系。
@author lyramilk@qq.com
@version 1



<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>Document</title>
		<script type="text/javascript" charset="utf-8" src="s/ArrawDiagrams.js"></script>
	</head>
	<body>eee<br/>
		aaa<canvas id="myc" width="500" height="500" style="border:1px dashed #8A2BE2;padding:0px"></canvas>
	</body>
	<script>
		let g = new ArrawDiagrams("myc");
		g.node({id:"id1",label:"服务1",y:50});
		g.node({id:"id2",label:"主数据库",y:250});
		g.node({id:"id3",label:"从库1",y:250});
		g.node({id:"id4",label:"从库2",y:250});
		g.node({id:"id5",label:"从库3",y:250});
		g.arraw({from:"id1",to:"id2"});
		g.arraw({from:"id2",to:"id3"});
		g.arraw({from:"id2",to:"id4"});
		g.arraw({from:"id2",to:"id5"});
		g.update();

		g.AddLine.push(function(from,to){
			alert("创建依赖关系，从" + from.label + "到" + to.label);
		});

		g.RemoveLine.push(function(from,to){
			alert("删除依赖关系，从" + from.label + "到" + to.label);
		});

	</script>
</html>

*/
function ArrawDiagramsNode(diag,id,label,x,y)
{
	this.label = label;
	this.id = id;
	this._x = x || 30;
	this._y = y || 30;
	this.diag = diag;



	let e = this.diag.ctx.measureText(this.label);
	this.fw = e.width;
	this.fh = e.actualBoundingBoxAscent + e.actualBoundingBoxDescent;
	this.w = this.fw + 30;
	this.h = this.fh + 15;

	this.cx = this._x + this.w * 0.5;
	this.cy = this._y + this.h * 0.5;
}

ArrawDiagramsNode.prototype.update = function()
{
	this.diag.update();
}

Object.defineProperty(ArrawDiagramsNode.prototype,"x",{
	configurable:false,
	enumerable:true,
	get:function(){
		return this._x;
	},
	set:function(value){
		this._x = value;
		this.cx = this._x + this.w * 0.5;
		this.diag.onCoordChange(this);
	}
});

Object.defineProperty(ArrawDiagramsNode.prototype,"y",{
	configurable:false,
	enumerable:true,
	get:function(){
		return this._y;
	},
	set:function(value){
		this._y = value;
		this.cy = this._y + this.h * 0.5;
		this.diag.onCoordChange(this);
	}
});

function ArrawDiagramsLine(diag,from,to)
{
	this.from = from;
	this.to = to;
	this.diag = diag;
}

ArrawDiagramsLine.prototype.update = function()
{
	this.diag.update();
}



function ArrawDiagrams_event_mousedown(e)
{
	let obj = this.ArrawDiagrams.pickup(e.offsetX,e.offsetY);

	if(obj instanceof ArrawDiagramsNode){
		this.ArrawDiagrams.pickObject = obj;
		this.ArrawDiagrams.selectObject = obj;
		this.ArrawDiagrams.pickParam = {x:e.offsetX - obj.x,y:e.offsetY - obj.y}
		obj.x = e.offsetX - this.ArrawDiagrams.pickParam.x;
		obj.y = e.offsetY - this.ArrawDiagrams.pickParam.y;
		this.ArrawDiagrams.update();
	}else{
		this.ArrawDiagrams.selectObject = undefined;
		this.ArrawDiagrams.pickObject = undefined;
		if(obj instanceof ArrawDiagramsLine){
			this.ArrawDiagrams.pickObject = obj;
			this.ArrawDiagrams.selectObject = obj;

			let df = Math.sqrt((obj.cf.x - e.offsetX) ** 2 + (obj.cf.y - e.offsetY) ** 2);
			let du = Math.sqrt((obj.cu.x - e.offsetX) ** 2 + (obj.cu.y - e.offsetY) ** 2);

			if(df < du){
				this.ArrawDiagrams.pickParam = {node:this.ArrawDiagrams.node_dict[obj.to],from:true}
			}else{
				this.ArrawDiagrams.pickParam = {node:this.ArrawDiagrams.node_dict[obj.from],from:false}
			}
		}
		this.ArrawDiagrams.update();
	}
}




function ArrawDiagrams_event_mouseup(e)
{
	if(this.ArrawDiagrams.pickObject instanceof ArrawDiagramsLine){
		let node = this.ArrawDiagrams.pickup(e.offsetX,e.offsetY,true);
		if(node instanceof ArrawDiagramsNode){
			if(this.ArrawDiagrams.pickParam.from){
				if(this.ArrawDiagrams.pickObject.from != node.id){
					this.ArrawDiagrams.onRemoveLine(this.ArrawDiagrams.node_dict[this.ArrawDiagrams.pickObject.from],this.ArrawDiagrams.node_dict[this.ArrawDiagrams.pickObject.to]);
					this.ArrawDiagrams.pickObject.from = node.id;
					this.ArrawDiagrams.rebuildArrawParam(this.ArrawDiagrams.pickObject);
					this.ArrawDiagrams.onAddLine(this.ArrawDiagrams.node_dict[this.ArrawDiagrams.pickObject.from],this.ArrawDiagrams.node_dict[this.ArrawDiagrams.pickObject.to]);
				}
			}else{
				if(this.ArrawDiagrams.pickObject.to != node.id){
					this.ArrawDiagrams.onRemoveLine(this.ArrawDiagrams.node_dict[this.ArrawDiagrams.pickObject.from],this.ArrawDiagrams.node_dict[this.ArrawDiagrams.pickObject.to]);
					this.ArrawDiagrams.pickObject.to = node.id;
					this.ArrawDiagrams.rebuildArrawParam(this.ArrawDiagrams.pickObject);
					this.ArrawDiagrams.onAddLine(this.ArrawDiagrams.node_dict[this.ArrawDiagrams.pickObject.from],this.ArrawDiagrams.node_dict[this.ArrawDiagrams.pickObject.to]);
				}
			}
		}
		this.ArrawDiagrams.update();
	}


	if(this.ArrawDiagrams.pickObject instanceof ArrawDiagramsNode){
		this.ArrawDiagrams.update();
	}
	this.ArrawDiagrams.pickObject = undefined;
	this.ArrawDiagrams.selectObject = undefined;
}




function ArrawDiagrams_event_mousemove(e)
{
	if(this.ArrawDiagrams.pickObject instanceof ArrawDiagramsNode){
		this.ArrawDiagrams.pickObject.x = e.offsetX - this.ArrawDiagrams.pickParam.x;
		this.ArrawDiagrams.pickObject.y = e.offsetY - this.ArrawDiagrams.pickParam.y;
		this.ArrawDiagrams.update();
	}
	if(this.ArrawDiagrams.pickObject instanceof ArrawDiagramsLine){
		this.ArrawDiagrams.update(e.offsetX,e.offsetY);
	}
}



function ArrawDiagrams(cid)
{
	this.c = document.getElementById(cid);
	this.c.addEventListener("mousedown",ArrawDiagrams_event_mousedown);
	this.c.addEventListener("mouseup",ArrawDiagrams_event_mouseup);
	this.c.addEventListener("mousemove",ArrawDiagrams_event_mousemove);
	this.c.ArrawDiagrams = this;
	//this.strict = false;

	// 圆角矩形四角半径
	this.r = 10;
	// 被选中的线宽度，拾取宽度。
	this.D = 4;


	this.ctx = this.c.getContext("2d");
	this.ctx.font = '1em 宋体';
	this.node_dict = {};
	this.arraw_list = [];

	this.RemoveLine = [];	//	function(f,t);
	this.AddLine = [];	//	function(f,t);

	this.RemoveNode = [];	//	function(o);
	this.AddNode = [];	//	function(n);
}


ArrawDiagrams.prototype.onRemoveLine = function(f,t)
{
	console.log(f,t);
	for(let et of this.RemoveLine){
		et(f,t);
	}
}

ArrawDiagrams.prototype.onAddLine = function(f,t)
{
	for(let et of this.AddLine){
		et(f,t);
	}
}

ArrawDiagrams.prototype.onRemoveNode = function(o)
{
	for(let et of this.RemoveNode){
		et(o);
	}
}

ArrawDiagrams.prototype.onAddNode = function(n)
{
	for(let et of this.AddNode){
		et(n);
	}
}

ArrawDiagrams.prototype.node = function(obj)
{
	let e = this.ctx.measureText(obj.label);
	let fw = e.width;
	let fh = e.actualBoundingBoxAscent + e.actualBoundingBoxDescent;

	if(!obj.x){
		obj.x = (this.c.width - fw) * 0.5;
	}

	if(!obj.y){
		obj.y = (this.c.height - fh)*0.5;
	}


	this.node_dict[obj.id] = new ArrawDiagramsNode(this,obj.id,obj.label,obj.x,obj.y);
}


ArrawDiagrams.prototype.pickup = function(x,y,nodeonly)
{
	for(let nodeid in this.node_dict){
		let node = this.node_dict[nodeid];
		if(x < node.x) continue;
		if(y < node.y) continue;
		if(x > node.x + node.w) continue;
		if(y > node.y + node.h) continue;
		return node;
	}
	if(!nodeonly){
		for(let al of this.arraw_list){
			let d = Math.abs((al.A * x + al.B * y + al.C) / Math.sqrt(al.A**2 + al.B **2));

			if(d < this.D){
				if(Math.abs(al.k) < 1){
					if((x > al.cf.x && x < al.cu.x) || (x > al.cu.x && x < al.cf.x)){
						return al;
					}
				}else{
					if((y > al.cf.y && y < al.cu.y) || (y > al.cu.y && y < al.cf.y)){
						return al;
					}
				}
			}
		}
	}
	return undefined;
}


ArrawDiagrams.prototype.arraw = function(aw)
{
	if (aw.from in this.node_dict && aw.to in this.node_dict)
	{
		let al = new ArrawDiagramsLine(this,aw.from,aw.to);
		if(this.rebuildArrawParam(al)){
			this.arraw_list.push(al);
		}
		return true;
	}
	return false;
}

ArrawDiagrams.prototype.onCoordChange = function(node)
{
	for(let al of this.arraw_list){
		if(node.id == al.from || node.id == al.to) {
			this.rebuildArrawParam(al);
		}
	}
	return true;
}

ArrawDiagrams.prototype.rebuildArrawParam = function(al)
{
	let f = this.node_dict[al.from];
	let u = this.node_dict[al.to];
	if(!f || !u) return false;

	let cx = f.cx;
	let cy = f.cy;

	let ux = u.cx;
	let uy = u.cy;

	al.k = (cy - uy) / (cx - ux);
	al.b = cy-al.k * cx;

	al.A = uy - cy;
	al.B = cx - ux;
	al.C = ux * cy - cx * uy;

	let r = this.r;


	al.cf = this.findCoord(al.k,al.b,f.x,f.y,f.h,f.w,cx,cy,ux,uy,r);
	al.cu = this.findCoord(al.k,al.b,u.x,u.y,u.h,u.w,ux,uy,cx,cy,r);
	return true;
}



ArrawDiagrams.prototype.update = function(offsetX,offsetY)
{
	this.ctx.clearRect(0,0,this.c.width,this.c.height)

	for(let nodeid in this.node_dict){
		let node = this.node_dict[nodeid];
		this.draw(node);
	}

	for(let al of this.arraw_list){
		let isSelected = false;
		if(this.selectObject instanceof ArrawDiagramsNode){
			isSelected = this.selectObject.id == al.from || this.selectObject.id == al.to;
		}
		if(this.selectObject instanceof ArrawDiagramsLine){
			isSelected = this.selectObject == al;
		}

		this.draw_line(al.cf.x,al.cf.y,al.cu.x,al.cu.y,isSelected?this.D:1,"#0000ff");
	}

	//绘制被拾取的绿色线
	if(this.pickObject instanceof ArrawDiagramsLine){
		if(this.pickParam.from){
			let t = this.findCoord(undefined,undefined,this.pickParam.node.x,this.pickParam.node.y,this.pickParam.node.h,this.pickParam.node.w,this.pickParam.node.cx,this.pickParam.node.cy,offsetX,offsetY,this.r);
			this.draw_line(offsetX,offsetY,t.x,t.y,this.D,"#00ff00");
		}else{
			let f = this.findCoord(undefined,undefined,this.pickParam.node.x,this.pickParam.node.y,this.pickParam.node.h,this.pickParam.node.w,this.pickParam.node.cx,this.pickParam.node.cy,offsetX,offsetY,this.r);
			this.draw_line(f.x,f.y,offsetX,offsetY,this.D,"#00ff00");
		}
	}
}


ArrawDiagrams.prototype.findCoord = function(k,b,x,y,h,w,x1,y1,x2,y2,r)
{
	let left = x1 > x2;
	let top = y1 > y2;

	// 求斜率
	if(!k){
		k = (y1 - y2) / (x1 - x2);
	}
	if(!b){
		b = y1-k * x1;
	}

	let y2p = y1;
	let x2p = x1; 

	// 情况一，箭头线与上下水平线相交
	y2p = top?y:y + h;
	if(x1 == x2){
		x2p = x1;
	}else{
		x2p = (y2p - b) / k;

		if(x2p < x || x2p > x + w){
			// 情况二，箭头线与左右竖直线相交
			x2p = left?x:x+w;
			if(y1 == y2){
				y2p = y1;
			}else{
				y2p = k * x2p + b;
			}
		}
	}
/*
	if(this.strict){
		// 情况三，在圆角上
		let t1 = x2p < x + r;
		let t2 = x2p > x + w - r;
		let t3 = y2p < y + r;
		let t4 = y2p > y + h - r;

		let cx = x;
		let cy = y;

		if((t1 || t2) && (t3 || t4)){
			if(t1){
				// 左
				cx = x + r*0.5;
			}else{
				// 右
				cx = x + w - r*0.5;
			}
			if(t3){
				cy = y + r*0.5
				// 上
			}else{
				// 下
				cy = y + h - r*0.5;
			}

			...
		}
	}*/

	return {x:x2p,y:y2p}
}


ArrawDiagrams.prototype.draw = function(d)
{
	let tw = this.ctx.measureText( d.label ).width;
	this.ctx.lineWidth = 1;

	let isSelected = false;
	if(this.selectObject instanceof ArrawDiagramsNode){
		isSelected = this.selectObject.id == d.id;
	}

	let r = this.r;

	let x = d.x;
	let y = d.y;
	let h = d.h;
	let w = d.w;
	if (w < 2 * r) {r = w / 2;}
	if (h < 2 * r){ r = h / 2;}

	this.ctx.beginPath();
	this.ctx.moveTo(x+r, y);
	this.ctx.arcTo(x+w, y, x+w, y+h, r);
	this.ctx.arcTo(x+w, y+h, x, y+h, r);
	this.ctx.arcTo(x, y+h, x, y, r);
	this.ctx.arcTo(x, y, x+w, y, r);
	this.ctx.closePath();
	this.ctx.strokeStyle = "#0000ff";
	this.ctx.stroke();
	if(isSelected){
		this.ctx.fillStyle="#0000ff80";
		this.ctx.fill();
	}
	this.ctx.fillStyle="#000000";
	this.ctx.fillText(d.label,d.x + (d.w-d.fw)*0.5,d.y + d.h - (d.h - d.fh)*0.6);
}



ArrawDiagrams.prototype.draw_line = function(cx,cy,ux,uy,lineWidth,style)
{
	this.ctx.lineWidth = lineWidth;

	this.ctx.beginPath();

	this.ctx.moveTo(cx,cy);
	this.ctx.lineTo(ux,uy);


	let theta = 30;
	let angle = Math.atan2(uy - cy, ux - cx) * 180 / Math.PI;
	let a1 = (angle + theta) * Math.PI / 180;
	let a2 = (angle - theta) * Math.PI / 180;

	let topX = ux - 10 * Math.cos(a1);
	let topY = uy - 10 * Math.sin(a1);
	let botX = ux - 10 * Math.cos(a2);
	let botY = uy - 10 * Math.sin(a2);


	this.ctx.moveTo(ux,uy);
	this.ctx.lineTo(topX,topY);
	this.ctx.moveTo(ux,uy);
	this.ctx.lineTo(botX,botY);

	this.ctx.closePath();
	this.ctx.strokeStyle = style;
	this.ctx.stroke();


}

