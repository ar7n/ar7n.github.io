function getGeometryCone(gl) {
    var num = 100;
    var height = 200;
    var radius = 200;
    var points = [];
    var normals = [];
    var textcoords = [];
    var p_top = [0, 0, 0];
    var p_bottom = [0, -height, 0];
    for (var i=0; i<num; i++) {
        points.push.apply(points, p_top);
        var p1 = [Math.sin(Math.PI * 2 * i / num) * radius, -height, Math.cos(Math.PI * 2 * i / num) * radius];
        var p2 = [Math.sin(Math.PI * 2 * (i + 1) / num) * radius, -height, Math.cos(Math.PI * 2 * (i + 1) / num) * radius];
        var p12 = [Math.sin(Math.PI * 2 * (i + 0.5) / num) * radius, -height, Math.cos(Math.PI * 2 * (i + 0.5) / num) * radius];
        points.push.apply(points, p1);
        points.push.apply(points, p2);
        points.push.apply(points, p_bottom);
        points.push.apply(points, p2);
        points.push.apply(points, p1);
        var v_axis = v3.sub(p_top, p_bottom);
        var v_generatrix_1 = v3.sub(p_top, p1);
        var v_generatrix_2 = v3.sub(p_top, p2);
        var v_generatrix_12 = v3.sub(p_top, p12);        
        var v_radius_1 = v3.sub(p1, p_bottom);
        var v_radius_2 = v3.sub(p2, p_bottom);
        var v_radius_12 = v3.sub(p12, p_bottom);        
        var v_normal_1 = v3.norm(v3.mul(v3.mul(v_axis, v_radius_1), v_generatrix_1));
        var v_normal_2 = v3.norm(v3.mul(v3.mul(v_axis, v_radius_2), v_generatrix_2));
        var v_normal_12 = v3.norm(v3.mul(v3.mul(v_axis, v_radius_12), v_generatrix_12));
        normals.push.apply(normals, v_normal_12);
        normals.push.apply(normals, v_normal_1);
        normals.push.apply(normals, v_normal_2);
        normals.push.apply(normals, [0, -1, 0]);
        normals.push.apply(normals, [0, -1, 0]);
        normals.push.apply(normals, [0, -1, 0]);
        textcoords.push.apply(textcoords, [(1 / num) * (i + 0.5), 0]);
        textcoords.push.apply(textcoords, [(1 / num) * i , 1]);
        textcoords.push.apply(textcoords, [(1 / num) * (i + 1) , 1]);
        textcoords.push.apply(textcoords, [0.5, 0.5]);
        textcoords.push.apply(textcoords, [((p2[0] / 200) + 1) / 2, ((p2[1] / 200) + 1) / 2]);
        textcoords.push.apply(textcoords, [((p2[0] / 200) + 1) / 2, ((p2[1] / 200) + 1) / 2]);
    }
    return {points: new Float32Array(points), normals: new Float32Array(normals), textcoords: new Float32Array(textcoords)};    
}

function setNoramlsCone(gl) {

}