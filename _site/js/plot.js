var Plot = function(canvas, xMin, xMax, yMin, yMax) {
  this.canvas = canvas;
  this.xMin = this.xMinOriginal = xMin;
  this.xMax = this.xMaxOriginal = xMax;
  this.yMin = this.yMinOriginal = yMin;
  this.yMax = this.yMaxOriginal = yMax;
  this.curves = [];
};

Plot.prototype.drawPointsInterpolation = function(points, linearAproximation){
  var context = this.canvas.getContext('2d');
  var i;
  context.strokeStyle = 'red';
  context.lineWidth = 1;          
  context.beginPath();
  if (linearAproximation) {
     context.moveTo(points[0].x, points[0].y); 
    for(i=0;i<points.length;i++) {
     context.lineTo(points[i].x, points[i].y);
     context.moveTo(points[i].x, points[i].y);
    }
  } else {
    for (i=0;i<points.length-1;i++) {
      var xc = (points[i].x + points[i + 1].x) / 2;
      var yc = (points[i].y + points[i + 1].y) / 2;
      context.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
  }
  context.stroke();
};

Plot.prototype.drawCurveInPolarCoordinates = function(curve){
  var stepTheta = (2*Math.PI) / 360;
  var i;
  var points = [];
  var pointInCartesian;
  for (i=0; i<2*Math.PI; i+=stepTheta) {
    pointInCartesian = this.fromPolarToCartesian(curve.f(i),i);
    points.push(this.fromCartesianToPixel(pointInCartesian.x, pointInCartesian.y));
  }
  this.drawPointsInterpolation(points);
};

Plot.prototype.drawCurve = function(curve){
  var i;
  var points = [];
  var stepX = 1;
  for (i=0;i<=this.canvas.width;i+=stepX) {
    var cartesian = this.fromPixelToCartesian(i,0); 
    points.push({
      x: i, 
      y: this.fromCartesianToPixel(i, curve.f(cartesian.x)).y
    });
  }
  this.drawPointsInterpolation(points);
};

Plot.prototype.draw = function() {
  var i;
  this.drawGrid(Math.PI, 1);
  for (i=0; i<this.curves.length; ++i) {
    this.drawCurve(this.curves[i]);
  }
};

Plot.prototype.drawInPolarCoordinates = function() {
  var i;
  this.drawPolarGrid(1, Math.PI/8);
  for (i=0; i<this.curves.length; ++i) {
    this.drawCurveInPolarCoordinates(this.curves[i]);
  }
}

Plot.prototype.fromPixelToCartesian = function(x, y) {
  return {
    x : this.xMin + (x / this.canvas.width) * (this.xMax-this.xMin),
    y : this.yMin + (y / this.canvas.height) * (this.yMax-this.yMin)
  }
};

Plot.prototype.fromCartesianToPixel = function(x, y) {
  return {
    x : ((x - this.xMin) / (this.xMax-this.xMin)) * this.canvas.width,
    y : this.canvas.height*(1 - (y - this.yMin) / (this.yMax-this.yMin)) 
  };
};

Plot.prototype.fromPolarToCartesian = function(r, theta) {
  return {
    x : r * Math.cos(theta),
    y : r * Math.sin(theta)
  };
};

Plot.prototype.drawPolarGrid = function(stepR, stepTheta, color) {
  var context = this.canvas.getContext('2d');
  var i;
  var previousColor;
  var radius;
  var origin = this.fromCartesianToPixel(0,0);
  var xMin = this.fromCartesianToPixel(this.xMin,0);
  var xMax = this.fromCartesianToPixel(this.xMax,0);
  var diagonalCanvasPixelsLength = Math.sqrt(this.canvas.height*this.canvas.height 
    + this.canvas.width*this.canvas.width);
  var xOffset = (diagonalCanvasPixelsLength - (xMax.x - xMin.x)) / 2;
  context.strokeStyle = color || 'rgb(51,51,50)';
  context.beginPath();
  for (i=stepR;i<=this.xMax;i+=stepR) {
    radius = this.fromCartesianToPixel(i,0);
    context.arc(origin.x,origin.y,radius.x - origin.x,0,Math.PI*2,true);
  }
  context.stroke();
  context.beginPath();
  for (i=0;i<=2*Math.PI;i+=stepTheta) {
    context.save();
    context.translate(origin.x,origin.y);
    context.rotate(i);
    context.translate(-origin.x,-origin.y);
    context.moveTo(
      xMin.x - xOffset, 
      xMin.y);
    context.lineTo(
      xMax.x + xOffset, 
      xMax.y);
    context.restore();
  }
  context.stroke();
}

Plot.prototype.drawGrid = function(stepX, stepY, color) {
  var context = this.canvas.getContext('2d');
  var i;
  var previousColor;
  context.strokeStyle = color || 'rgb(51,51,50)';
  for (i=this.xMin;i<=this.xMax;i+=stepX) {
    context.beginPath();
    context.moveTo(
      this.fromCartesianToPixel(i,this.yMin).x, 
      this.fromCartesianToPixel(i,this.yMin).y);
    context.lineTo(
      this.fromCartesianToPixel(i,this.yMax).x, 
      this.fromCartesianToPixel(i,this.yMax).y);
    if (i == 0) {
      previousColor = context.strokeStyle;
      context.strokeStyle = 'green';
      context.stroke();
      context.strokeStyle = previousColor;
    } else {
      context.stroke();
    }
  }
  for (i=this.yMin;i<this.yMax;i+=stepY) {
    context.beginPath();
    context.moveTo(
      this.fromCartesianToPixel(this.xMin, i).x,
      this.fromCartesianToPixel(this.xMin, i).y);
    context.lineTo(
      this.fromCartesianToPixel(this.xMax, i).x,
      this.fromCartesianToPixel(this.xMax, i).y);
    if (i == 0) {
      previousColor = context.strokeStyle;
      context.strokeStyle = 'green';
      context.stroke();
      context.strokeStyle = previousColor;
    } else {
      context.stroke();
    }            
  }
};