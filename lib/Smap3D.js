var Smap3D = function (properties) {
    //
    var renderer = properties.renderer && properties ? properties.renderer : null;
    //
    return {
        'version': 0.1,
        'author': 'erem@sweco',
        'description': '3D Web Mapping Library',
        'getRenderer': function () {
            return renderer;
        }
    }
};