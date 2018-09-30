function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

canvas = document.getElementById('view');
var displayWidth  = canvas.clientWidth;
var displayHeight = canvas.clientHeight;
canvas.width  = displayWidth * 2;
canvas.height = displayHeight * 2;

gl = canvas.getContext('webgl');

if (!gl) {
  console.error('WebGL is not supported');
}

var vertexShaderSource = document.getElementById("2d-vertex-shader").text;
var fragmentShaderSource = document.getElementById("2d-fragment-shader").text;

var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

var program = createProgram(gl, vertexShader, fragmentShader);

var positionLocation = gl.getAttribLocation(program, "a_position");
var aspectRatioLocation = gl.getUniformLocation(program, "u_aspect_ratio");
var scaleLocation = gl.getUniformLocation(program, "u_scale");

var positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1
]), gl.STATIC_DRAW);

requestAnimationFrame(drawScene);

function drawScene(now) {
  var aspect_ratio = canvas.clientWidth / canvas.clientHeight;

  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);

  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.uniform1f(aspectRatioLocation, aspect_ratio);
  gl.uniform1f(scaleLocation, now);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
  requestAnimationFrame(drawScene);
}

