(function () {
    // Create a new instance of Smap3D and activate 
    // the default map controls and renderers. 
    var map = Smap3D({
        renderer: Smap3D.Renderer() // like 'new Smap.Renderer()' but without new.
    });

    var gl, canvas;
    var zoom = 60; //Initial zoom level (0-100)
    var renderer = map.getRenderer();

    canvas = $('canvas')[0];

    renderer.initGL(canvas);
    renderer.initShaders();
    renderer.initBuffers();
    renderer.loadTexture();

    gl = renderer.getGl();
    gl.enable(gl.DEPTH_TEST);

    renderer.drawScene(zoom);
    $('#zoom').html(zoom);

    // ***
    // Init events
    // ***
    $('canvas').click(function () {
        renderer.spin(1, 5); //(direction, time)
    });


    // Rotate Left event
    //
    $('#left').mousehold(1, function () {
        renderer.rotateView;
        if ($('#x')[0].checked) {
            renderer.rotateView(1, 'x');
        } else if ($('#y')[0].checked) {
            renderer.rotateView(1, 'y');
        } else if ($('#z')[0].checked) {
            renderer.rotateView(1, 'z');
        }
    });

    // Rotate Right event
    //
    $('#right').mousehold(1, function () {
        renderer.rotateView;
        if ($('#x')[0].checked) {
            renderer.rotateView(-1, 'x');
        } else if ($('#y')[0].checked) {
            renderer.rotateView(-1, 'y');
        } else if ($('#z')[0].checked) {
            renderer.rotateView(-1, 'z');
        }
    });

    // Zoom In Event
    //
    $('#in').mousehold(1, function () {
        var z = renderer.getZoomLevel();
        if (renderer.zoom(z)) {
            renderer.setZoomLevel(z -= 1);
        }
        $('#zoom').html(z);
    });

    // Zoom Out Event
    //
    $('#out').mousehold(1, function () {
        var z = renderer.getZoomLevel();
        if (renderer.zoom(z)) {
            renderer.setZoomLevel(z += 1);
        }
        $('#zoom').html(z);
    });

    // Pan events
    //
    $('#panXp').mousehold(20, function () {
        renderer.pan(1);
    });
    $('#panXm').mousehold(20, function () {
        renderer.pan(2);
    });
    $('#panYp').mousehold(20, function () {
        renderer.pan(3);
    });
    $('#panYm').mousehold(20, function () {
        renderer.pan(4);
    });
    $('#panZp').mousehold(20, function () {
        renderer.pan(5);
    });
    $('#panZm').mousehold(20, function () {
        renderer.pan(6);
    });

} ());