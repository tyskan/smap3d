// Initialize the GL object from canvas getContext.
//
// TODO: Documentation
// TODO: The map does not render on startup. Solve: Fix the drawScene method.
// TODO: (And why do i need to turn the map PI/2 ccw?)
//
Smap3D.Renderer = function () {
    //
    var _gl = null,
    //
    _shaderProgram = null,
    //
    _mvMatrix = mat4.create(),
    //
    _pMatrix = mat4.create(),
    //
    _positionBuffer = null,
    //
    _textureBuffer = null,
    //
    _indexBuffer = null,
    //
    _zoomLevel = 60,
    //
    _texture = null,
    //
    _textureBuffer = null;
    //
    return {
        //
        //
        //
        initGL: function (canvas) {
            try {
                _gl = canvas.getContext("experimental-webgl");
                _gl.viewportWidth = canvas.width;
                _gl.viewportHeight = canvas.height;
            } catch (e) {
            }
            if (!_gl) {
                alert("You have no support for WebGL.");
            }
        },
        //
        //
        //
        getShader: function (id) {
            var shaderScript = document.getElementById(id),
                str = "",
                shader,
                k;

            if (!shaderScript) {
                return null;
            }

            k = shaderScript.firstChild;
            while (k) {
                if (k.nodeType == 3) {
                    str += k.textContent;
                }
                k = k.nextSibling;
            }

            if (shaderScript.type == "x-shader/x-fragment") {
                shader = _gl.createShader(_gl.FRAGMENT_SHADER);
            } else if (shaderScript.type == "x-shader/x-vertex") {
                shader = _gl.createShader(_gl.VERTEX_SHADER);
            } else {
                return null;
            }

            _gl.shaderSource(shader, str);
            _gl.compileShader(shader);

            if (!_gl.getShaderParameter(shader, _gl.COMPILE_STATUS)) {
                alert(_gl.getShaderInfoLog(shader));
                return null;
            }

            return shader;
        },
        //
        //
        //
        initShaders: function () {
            var fragmentShader = this.getShader("shader-fs");
            var vertexShader = this.getShader("shader-vs");

            _shaderProgram = _gl.createProgram();
            _gl.attachShader(_shaderProgram, vertexShader);
            _gl.attachShader(_shaderProgram, fragmentShader);
            _gl.linkProgram(_shaderProgram);

            if (!_gl.getProgramParameter(_shaderProgram, _gl.LINK_STATUS)) {
                alert("Could not initialise shaders");
            }

            _gl.useProgram(_shaderProgram);

            _shaderProgram.vertexPositionAttribute = _gl.getAttribLocation(_shaderProgram, "aVertexPosition");
            _gl.enableVertexAttribArray(_shaderProgram.vertexPositionAttribute);

            _shaderProgram.textureCoordAttribute = _gl.getAttribLocation(_shaderProgram, "aTextureCoord");
            _gl.enableVertexAttribArray(_shaderProgram.textureCoordAttribute);

            _shaderProgram.pMatrixUniform = _gl.getUniformLocation(_shaderProgram, "uPMatrix");
            _shaderProgram.mvMatrixUniform = _gl.getUniformLocation(_shaderProgram, "uMVMatrix");
            _shaderProgram.samplerUniform = _gl.getUniformLocation(_shaderProgram, "uSampler");
        },
        //
        //
        //
        setMatrixUniforms: function () {
            _gl.uniformMatrix4fv(_shaderProgram.pMatrixUniform, false, _pMatrix);
            _gl.uniformMatrix4fv(_shaderProgram.mvMatrixUniform, false, _mvMatrix);
        },
        //
        //
        //
        initBuffers: function () {

            //**********
            _positionBuffer = _gl.createBuffer();
            _gl.bindBuffer(_gl.ARRAY_BUFFER, _positionBuffer);
            vertices = [
		         -1, -1, 0,
		         -1, 1, 0,
		         1, 1, 0,
		         1, -1, 0,
                 -1, -1, 0
	        ];
            _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.STATIC_DRAW);
            _positionBuffer.itemSize = 3;
            _positionBuffer.numItems = vertices.length / _positionBuffer.itemSize;

            //**********
            _textureBuffer = _gl.createBuffer();
            _gl.bindBuffer(_gl.ARRAY_BUFFER, _textureBuffer);
            var textureCoords = [
	           0, 0,
	           1,0,
	           1, 1,
	           0,1,
               0,0
	        ];
            _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(textureCoords), _gl.STATIC_DRAW);
            _textureBuffer.itemSize = 2;
            _textureBuffer.numItems = textureCoords.length / textureCoords.itemSize;

            //**********
            _indexBuffer = _gl.createBuffer();
            _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, _indexBuffer);
            var vertexIndices = [
		        0, 1, 2, 0, 2, 3
            ];
            _gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), _gl.STATIC_DRAW);
            _indexBuffer.itemSize = 1;
            _indexBuffer.numItems = vertexIndices.length / vertexIndices.itemSize;
        },
        //
        //
        //
        handleLoadedTexture: function () {
            _gl.bindTexture(_gl.TEXTURE_2D, _texture);
            _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEB_gl, true);
            _gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, _texture.image);
            _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.NEAREST);
            _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.NEAREST);
            _gl.bindTexture(_gl.TEXTURE_2D, null);
        },
        //
        //
        //
        loadTexture: function () {
            _texture = _gl.createTexture();
            _texture.image = new Image();
            var that = this;
            _texture.image.onload = function () {
                that.handleLoadedTexture(_texture);
            }

            _texture.image.src = "img/sthlm.gif";
        },
        //
        //
        //
        degToRad: function (degrees) {
            return degrees * Math.PI / 180;
        },
        //
        //
        //
        drawScene: function (zoom) {
            _gl.viewport(0, 0, _gl.viewportWidth, _gl.viewportHeight);
            _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);

            mat4.perspective(_zoomLevel, 1, 0.1, 100.0, _pMatrix);
            mat4.identity(_mvMatrix);
            mat4.translate(_mvMatrix, [0, 0.0, -2.0]);
            mat4.rotate(_mvMatrix, -(Math.PI/2), [0, 0, 1]);
        },
        //
        //
        //
        draw: function () {
            _gl.drawArrays(_gl.TRIANGLE_STRIP, 0, _positionBuffer.numItems);
            _gl.bindBuffer(_gl.ARRAY_BUFFER, _positionBuffer);
            _gl.vertexAttribPointer(_shaderProgram.vertexPositionAttribute, _positionBuffer.itemSize, _gl.FLOAT, false, 0, 0);

            _gl.bindBuffer(_gl.ARRAY_BUFFER, _textureBuffer);
            _gl.vertexAttribPointer(_shaderProgram.textureCoordAttribute, _textureBuffer.itemSize, _gl.FLOAT, false, 0, 0);
            _gl.activeTexture(_gl.TEXTURE0);

            _gl.bindTexture(_gl.TEXTURE_2D, _texture);
            _gl.uniform1i(_shaderProgram.samplerUniform, 0);
            _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, _indexBuffer);
            this.setMatrixUniforms();
            _gl.drawElements(_gl.TRIAN_glES, _indexBuffer.numItems, _gl.UNSIGNED_SHORT, 0);
        },
        //
        //
        //
        getGl: function () {
            return _gl;
        },
        //
        //
        //
        getZoomLevel: function () {
            return _zoomLevel;
        },
        //
        //
        //
        setZoomLevel: function (val) {
            _zoomLevel = val;
        },
        //
        //
        //
        rotateView: function (direction, axis) {

            var degree = direction != -1 ? (Math.PI / 180) : degree = -(Math.PI / 180);

            switch (axis) {
                case ('x'):
                    mat4.rotate(_mvMatrix, degree, [1, 0, 0]);
                    break;
                case ('y'):
                    mat4.rotate(_mvMatrix, degree, [0, 1, 0]);
                    break;
                case ('z'):
                    mat4.rotate(_mvMatrix, degree, [0, 0, 1]);
                    break;
                default:
                    break;
            }

            this.setMatrixUniforms();
            _gl.drawArrays(_gl.TRIANGLE_STRIP, 0, _positionBuffer.numItems);

        },
        //
        //
        //
        zoom: function (z) {
            if (z > 0 && z < 100) {
                mat4.perspective(_zoomLevel, 1, 0.1, 100.0, _pMatrix);
                this.draw();
                return true;
            } else {
                _zoomLevel = _zoomLevel == 100 ? _zoomLevel = 99 : _zoomLevel = 1;
                return false;
            }

        },
        //
        //
        //
        spin: function (direction, time) {
            var z = 0;
            var rand, i;
            var that = this;
            var u = function () {
                if (z < time * 180) {
                    if ((z % 180) == 0) {
                        i += 1;
                    }
                    that.rotateView(direction, 'x');
                    setTimeout(function () {
                        u(time); //Spin time
                    }, 1); //Interval
                }
                z += 1;
            };
            setTimeout(u, 1);
        },
        //
        //
        //
        pan: function (direction) {

            _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);

            switch (direction) {
                case (1):
                    mat4.translate(_mvMatrix, [0.03, 0, 0, ]);
                    break;
                case (2):
                    mat4.translate(_mvMatrix, [-0.03, 0, 0]);
                    break;
                case (3):
                    mat4.translate(_mvMatrix, [0, 0.03, 0]);
                    break;
                case (4):
                    mat4.translate(_mvMatrix, [0, -0.03, 0]);
                    break;
                case (5):
                    mat4.translate(_mvMatrix, [0, 0, 0.03]);
                    break;
                case (6):
                    mat4.translate(_mvMatrix, [0, 0, -0.03]);
                    break;
            }

            this.setMatrixUniforms();
            _gl.drawArrays(_gl.TRIANGLE_STRIP, 0, _positionBuffer.numItems);
        }
    };
};