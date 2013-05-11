var MathFunction = function(f, parameters) {
  this.f = f.bind(this);
  this.functionName = f.name;
  if (parameters) {
    for (var key in parameters) {
      if (parameters.hasOwnProperty(key)) {
        this[key] = parameters[key];
      }
    }
  }
};

var TrigFunction = function(f) {
  MathFunction.call(this, f, {phase : 0, amplitude : 1, frequency : 1});
  this.f = function(x) {
    return this.amplitude*f(x*this.frequency + this.phase);
  }
};

TrigFunction.prototype.toTex = function() {
  return "\\(y = " + this.amplitude.toFixed(1) + "*" + this.functionName + "(" + this.frequency.toFixed(1) + "*x+" + this.phase + ")\\)";
}
