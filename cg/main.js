// @TODO Сделать точечное освещение
// @TODO Наложить текстуру
// @TODO Разбить конус на части

gl = document.getElementById('view').getContext('webgl');

if (!gl) {
    console.error('WebGL is not supported');
}

var vertexShaderSource = document.getElementById("3d-vertex-shader").text;
var fragmentShaderSource = document.getElementById("3d-fragment-shader").text;
 
var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

var program = createProgram(gl, vertexShader, fragmentShader);

// look up where the vertex data needs to go.
var positionLocation = gl.getAttribLocation(program, "a_position");
var normalLocation = gl.getAttribLocation(program, "a_normal");
var texcoordLocation = gl.getAttribLocation(program, "a_texcoord");

// lookup uniforms
var worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
var worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
var worldLocation = gl.getUniformLocation(program, "u_world");
var colorLocation = gl.getUniformLocation(program, "u_color");
var lightWorldPositionLocation = gl.getUniformLocation(program, "u_lightWorldPosition");
var viewWorldPositionLocation = gl.getUniformLocation(program, "u_viewWorldPosition");
var shininessLocation = gl.getUniformLocation(program, "u_shininess");
var textureLocation = gl.getUniformLocation(program, "u_texture");

var geometry = getGeometryCone();

// Create a buffer and put three 2d clip space points in it
var positionBuffer = gl.createBuffer();
// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
// Put geometry data into buffer
gl.bufferData(gl.ARRAY_BUFFER, geometry.points, gl.STATIC_DRAW);

// Create a buffer to put normals in
var normalBuffer = gl.createBuffer();
// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = normalBuffer)
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
// Put normals data into buffer
gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW);

// создаём буфер для текстурных координат
var texcoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, geometry.textcoords, gl.STATIC_DRAW);

// Create a texture.
var texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
// Fill the texture with a 1x1 blue pixel.
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
// Asynchronously load an image
image = new Image();
image.src = 'texture.png';
image.addEventListener('load', function() {
    // Now that the image has loaded make copy it to the texture.
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
});

var translation_1 = [0, 600, -1000];
var translation_2 = [0, -600, 0];
var rotation = [0, 0, 0];
var scale = [1, 1, 1];
var fieldOfViewRadians = degToRad(60);
var rotationSpeed = 1.2;
var then = performance.now() * 0.001;

// code above this line is initialization code.
// code below this line is rendering code.
requestAnimationFrame(drawScene);

// Отрисовка сцены.
function drawScene(now) {
    // получаем время в секундах
    now *= 0.001;
    // вычитаем предыдущее значение времени от текущего
    var deltaTime = now - then;
    // запоминаем текущее время для следующего кадра
    then = now;

    rotation[1] += rotationSpeed * deltaTime;    

    resize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Turn on culling. By default backfacing triangles
    // will be culled.
    gl.enable(gl.CULL_FACE);

    // Enable the depth buffer
    gl.enable(gl.DEPTH_TEST);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 3 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset)

    // Turn on the normal attribute
    gl.enableVertexAttribArray(normalLocation);

    // Bind the normal buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

    // Tell the attribute how to get data out of normalBuffer (ARRAY_BUFFER)
    var size = 3;          // 3 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floating point values
    var normalize = false; // normalize the data (convert from 0-255 to 0-1)
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);

    // Turn on the teccord attribute
    gl.enableVertexAttribArray(texcoordLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(texcoordLocation, size, type, normalize, stride, offset);

    // Compute the matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var zNear = 1;
    var zFar = 2000;
    var viewProjectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    
    var matrix = m4.identity();
    matrix = m4.translate(matrix, translation_1[0], translation_1[1], translation_1[2]);
    matrix = m4.zRotate(matrix, Math.sin(rotation[1]) * 1.3);
    matrix = m4.translate(matrix, translation_2[0], translation_2[1], translation_2[2]);
    matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

    // Draw a F at the origin
    var worldMatrix = matrix;

    // Multiply the matrices.
    var worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
    var worldInverseMatrix = m4.inverse(worldMatrix);
    var worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);

    // Set the matrix.
    gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
    gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
    gl.uniformMatrix4fv(worldLocation, false, worldMatrix);

    // Положение камеры/наблюдателя
    gl.uniform3fv(viewWorldPositionLocation, [0, 0, 0]);

    // установка степени яркости
    gl.uniform1f(shininessLocation, 50);

    // Set the color to use
    gl.uniform4fv(colorLocation, [0.2, 1, 0.2, 1]);

    // Задаём положение освещения
    gl.uniform3fv(lightWorldPositionLocation, [600, 1000, -1000]);

    // Tell the shader to use texture unit 0 for u_texture
    gl.uniform1i(textureLocation, 0);

    // Draw the geometry.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 600;
    gl.drawArrays(primitiveType, offset, count);

    requestAnimationFrame(drawScene);
}
