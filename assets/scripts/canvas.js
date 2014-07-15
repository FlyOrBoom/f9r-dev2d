
function canvas_init_pre() {
  prop.canvas={};

  prop.canvas.contexts={};

  // resize canvas to fit window?
  prop.canvas.resize=true;
  prop.canvas.size={ // all canvases are the same size
    height:480,
    width:640
  };
}

function canvas_init() {
  canvas_add("background");
  canvas_add("grid");
  canvas_add("ground");
  canvas_add("pads");
  canvas_add("craft");
  canvas_add("hud");
}

function canvas_resize() {
  if(prop.canvas.resize) {
    prop.canvas.size.width=$(window).width();
    prop.canvas.size.height=$(window).height();
  }
  for(var i in prop.canvas.contexts) {
    prop.canvas.contexts[i].canvas.height=prop.canvas.size.height;
    prop.canvas.contexts[i].canvas.width=prop.canvas.size.width;
  }
}

function canvas_add(name) {
  $("#canvases").append("<canvas id='"+name+"-canvas'></canvas>");
  prop.canvas.contexts[name]=$("#"+name+"-canvas").get(0).getContext("2d");
}

function canvas_get(name) {
  return(prop.canvas.contexts[name]);
}

function canvas_clear(cc) {
  cc.clearRect(0,0,prop.canvas.size.width,prop.canvas.size.height);
}

// DRAW

// background

function canvas_draw_background(cc) {
  var gradient=cc.createLinearGradient(0,-km_to_pixel(100)+prop.ui.pan[1],0,prop.ui.pan[1]);
  gradient.addColorStop(0,"#000");
  gradient.addColorStop(0.96,"#3288C9");
  gradient.addColorStop(0.99,"#def");
  gradient.addColorStop(1,"#eef");
  cc.fillStyle=gradient;
  cc.fillRect(0,0,prop.canvas.size.width,prop.canvas.size.height);
}

function canvas_draw_grid(cc) {
  return;
  cc.strokeStyle="rgba(0,0,0,0.2)";
  cc.lineWidth=2;
  cc.beginPath();
  for(var x=0;x<prop.canvas.size.width;x+=m_to_pixel(10)) {
    cc.moveTo(mod((x+prop.ui.pan[0]),prop.canvas.size.width),0);
    cc.lineTo(mod((x+prop.ui.pan[0]),prop.canvas.size.width),prop.canvas.size.height);
  }
  cc.stroke();
}

// ground

function canvas_draw_ground(cc) {
  cc.fillStyle="#2CBC64";
  cc.fillRect(0,prop.canvas.size.height/2+prop.ui.pan[1],
              prop.canvas.size.width,m_to_pixel(3));

  cc.fillStyle="#663322";
  cc.fillRect(0,Math.max(prop.canvas.size.height/2+m_to_pixel(3)+prop.ui.pan[1],0),
              prop.canvas.size.width,prop.canvas.size.height);

}

function canvas_draw_pad(cc,pad) {
  if(pad.material == "concrete") cc.fillStyle="#888";
  else if(pad.material == "asphalt") cc.fillStyle="#333";
  cc.fillRect(-m_to_pixel(pad.width/2),
              -m_to_pixel(pad.height),
              m_to_pixel(pad.width),
              m_to_pixel(5+pad.height));
  if(pad.material == "concrete") cc.fillStyle="#222";
  else if(pad.material == "asphalt") cc.fillStyle="#999";
  cc.font="14px bold monospace, 'Ubuntu Mono'";
  cc.textAlign="center";
  cc.fillText(pad.name,0,20-m_to_pixel(pad.height));
}

function canvas_draw_pads(cc) {
  
  for(var i=0;i<prop.ground.pads.length;i++) {
    var pad=prop.ground.pads[i];
    cc.save();
    cc.translate(prop.canvas.size.width/2+prop.ui.pan[0]+m_to_pixel(pad.x),prop.canvas.size.height/2+prop.ui.pan[1]);
    canvas_draw_pad(cc,pad);
    cc.restore();
  }
}

// craft

function canvas_draw_craft(cc) {
  cc.fillStyle="#fff";
  cc.strokeStyle="#222";

  var w=m_to_pixel(3.66);
  var h=m_to_pixel(42);

  var nosecone_height=m_to_pixel(0.8);

  cc.translate(prop.canvas.size.width/2,prop.canvas.size.height/2);
//  cc.translate(m_to_pixel(prop.craft.pos[0]),-m_to_pixel(prop.craft.pos[1]));
  cc.rotate(prop.craft.angle);
  cc.translate(0,-m_to_pixel(prop.craft.offset));
//  cc.translate(-prop.ui.pan[0],prop.ui.pan[1]);

  cc.beginPath();
  cc.moveTo(0,    -h/2);
  cc.lineTo(w/2,  -h/2+nosecone_height);
  cc.lineTo(w/2,   h/2);
  cc.lineTo(-w/2,  h/2);
  cc.lineTo(-w/2, -h/2+nosecone_height);
  cc.lineTo(0,    -h/2);
  cc.fill();

  cc.fillStyle="#468";

  var heatshield_height=m_to_pixel(3)-2;

  var f=trange(0,prop.craft.fuel,385000,0,m_to_pixel(40));

  cc.beginPath();
  cc.moveTo(w/2,  h/2-f-heatshield_height);
  cc.lineTo(w/2,  h/2-heatshield_height);
  cc.lineTo(-w/2, h/2-heatshield_height);
  cc.lineTo(-w/2, h/2-f-heatshield_height);
  cc.fill();

  heatshield_height+=2;

  if(prop.craft.crashed) {
    cc.fillStyle="#f88";

    cc.beginPath();
    cc.moveTo(0,    -h/2);
    cc.lineTo(w/2,  -h/2+nosecone_height);
    cc.lineTo(w/2,   h/2);
    cc.lineTo(-w/2,  h/2);
    cc.lineTo(-w/2, -h/2+nosecone_height);
    cc.lineTo(0,    -h/2);
    cc.fill();

  }

  cc.beginPath();
  cc.moveTo(0,    -h/2);
  cc.lineTo(w/2,  -h/2+nosecone_height);
  cc.lineTo(w/2,   h/2);
  cc.lineTo(-w/2,  h/2);
  cc.lineTo(-w/2, -h/2+nosecone_height);
  cc.lineTo(0,    -h/2);
  cc.stroke();

  cc.fillStyle="rgba(0,0,0,0.3)";

  var s=w/2/3;

  cc.beginPath();
  cc.moveTo(0,   -h/2);
  cc.lineTo(w/2, -h/2+nosecone_height);
  cc.lineTo(w/2,  h/2);
  cc.lineTo(s,    h/2);
  cc.lineTo(s,   -h/2+nosecone_height);
  cc.lineTo(0,   -h/2);
  cc.fill();

  cc.lineWidth=2;
  cc.beginPath()
  cc.lineTo(0,h/2);

  cc.strokeStyle="#f84";
  cc.lineWidth=4;
  cc.lineCap="round";

  var v=prop.craft.thrust_vector*prop.craft.vector_max;
  var throttle=trange(0,prop.craft.throttle,1,prop.craft.min_throttle,prop.craft.max_throttle);
  if(prop.craft.fuel <= 0) throttle=0;
  if(prop.craft.throttle <= 0.01) throttle=0;
  var s=m_to_pixel(10)*throttle;

  var force=[-sin(v)*s,cos(v)*s];

  if(prop.craft.engine_number >= 3 || prop.craft.engine_number == 1) {
    cc.moveTo(0,h/2);
    cc.lineTo(force[0],h/2+force[1]);
  }

  if(prop.craft.engine_number >= 3 || prop.craft.engine_number == 2) {
    var e=m_to_pixel(1);
    cc.moveTo(-e,h/2);
    cc.lineTo(-e+force[0],h/2+force[1]);

    cc.moveTo(e,h/2);
    cc.lineTo(e+force[0],h/2+force[1]);
  }

  cc.stroke();

  cc.strokeStyle="#fff";
  cc.lineWidth=2;

  cc.beginPath();
  s=m_to_pixel(crange(0,throttle,1,10,5))*throttle;
  force=[-sin(v)*s,cos(v)*s];

  if(prop.craft.engine_number >= 3 || prop.craft.engine_number == 1) {
    cc.moveTo(0,h/2);
    cc.lineTo(force[0],h/2+(force[1]));
  }

  if(prop.craft.engine_number >= 3 || prop.craft.engine_number == 2) {
    var e=m_to_pixel(1);
    cc.moveTo(-e,h/2);
    cc.lineTo(-e+force[0],h/2+force[1]);

    cc.moveTo(e,h/2);
    cc.lineTo(e+force[0],h/2+force[1]);
  }


  cc.stroke();

  cc.strokeStyle = "#666";

  cc.lineCap="butt";

  cc.lineWidth=4;
  s=m_to_pixel(1.0);
  var force=[-sin(v)*s,cos(v)*s];

  cc.beginPath();

  cc.moveTo(0,h/2);
  cc.lineTo(force[0],h/2+force[1]);

  var e=m_to_pixel(1);
  cc.moveTo(-e,h/2);
  cc.lineTo(-e+force[0],h/2+force[1]);

  cc.moveTo(e,h/2);
  cc.lineTo(e+force[0],h/2+force[1]);

  cc.stroke();

  cc.fillStyle="#333";
  if(prop.craft.gearDown) {
    var gw=m_to_pixel(15);
    var cw=m_to_pixel(0.5);
    var ch=m_to_pixel(2);
    var cd=m_to_pixel(0.8);
    var b=h/2+m_to_pixel(3.2);
    cc.moveTo(-gw/2,    b);
    cc.lineTo(-gw/2+cw, b);
    cc.lineTo(-w/2+cd,  h/2);
    cc.lineTo( w/2-cd,  h/2);
    cc.lineTo( gw/2-cw, b);
    cc.lineTo( gw/2,    b);
    cc.lineTo( gw/2,    b-cw);
    cc.lineTo( w/2,     h/2-ch);
    cc.lineTo(-w/2,     h/2-ch);
    cc.lineTo(-gw/2,    b-cw);
  }

  cc.moveTo( w/2, h/2-heatshield_height);
  cc.lineTo( w/2, h/2);
  cc.lineTo(-w/2, h/2);
  cc.lineTo(-w/2, h/2-heatshield_height);

  var leg_hinge_height=m_to_pixel(1.5);
  var leg_base_width=m_to_pixel(2);
  var leg_tip_width=m_to_pixel(0.5);
  var leg_length=m_to_pixel(5.5);
  var leg_skew=m_to_pixel(0.5);
  var leg_extend_angle=115;

  leg_extend_angle*=prop.craft.gear_animation.get();
  leg_extend_angle=radians(leg_extend_angle);

  cc.fill();

  cc.beginPath();
  
  cc.save()
  cc.translate(-w/2+leg_skew/1.5,h/2-4);
  cc.rotate(-leg_extend_angle);

  cc.translate(-leg_skew/2,-leg_hinge_height);
  cc.moveTo(leg_base_width/3+leg_skew,leg_base_width/2);
  cc.lineTo(leg_skew,leg_base_width);
  cc.lineTo(-leg_base_width/2+leg_skew,leg_base_width/2);
  cc.lineTo(-leg_tip_width/2,-leg_length);
  cc.lineTo(leg_tip_width/2,-leg_length);
  cc.lineTo(leg_base_width/3+leg_skew,leg_base_width/2);
  cc.restore();
  
  cc.save()
  cc.scale(-1,1);
  cc.translate(-w/2+leg_skew/1.5,h/2-4);
  cc.rotate(-leg_extend_angle);

  cc.translate(-leg_skew/2,-leg_hinge_height);
  cc.moveTo(leg_base_width/3+leg_skew,leg_base_width/2);
  cc.lineTo(leg_skew,leg_base_width);
  cc.lineTo(-leg_base_width/2+leg_skew,leg_base_width/2);
  cc.lineTo(-leg_tip_width/2,-leg_length);
  cc.lineTo(leg_tip_width/2,-leg_length);
  cc.lineTo(leg_base_width/3+leg_skew,leg_base_width/2);
  cc.restore();
  
  cc.lineWidth=1;
  cc.fillStyle="#fff";
  if(prop.craft.crashed) cc.fillStyle="#f88";
  cc.strokeStyle="#222";

  cc.fill();
  cc.stroke();

}

function canvas_draw_hud(cc) {
  cc.font="14px bold monospace, 'Ubuntu Mono'";
  cc.textAlign="center";
  if(prop.craft.crashed) {
    var opacity=crange(0,time()-prop.craft.crash_time,10,0,0.5);
    cc.fillStyle="rgba(0,0,0,"+opacity+")";
    cc.fillRect(0,0,prop.canvas.size.width,prop.canvas.size.height);
  }

  cc.fillStyle="rgba(0,0,0,0.4)";
  cc.fillRect(prop.canvas.size.width/2-300,9,600,30);
  cc.fillRect(0,prop.canvas.size.height-37,prop.canvas.size.width,30);
  
  if(prop.craft.crashed) {
    cc.fillStyle="rgba(191,32,0,0.8)";
    cc.fillRect(prop.canvas.size.width/2-300,prop.canvas.size.height/2-15,600,30);
  }
  cc.fillStyle="#fff";

  // altitude
  cc.fillText("alt "+prop.craft.getAltitude().toFixed(0)+"m",prop.canvas.size.width/2,30);

  // vspeed
  cc.fillText("v/s "+(prop.craft.rocket_body.velocity[1]+0.1).toFixed(0)+"m/s",prop.canvas.size.width/2-200,30);

  // hspeed
  cc.fillText("h/s "+(-prop.craft.rocket_body.velocity[0]+0.1).toFixed(0)+"m/s",prop.canvas.size.width/2+200,30);

  // help
  cc.fillText("keys: throttle: up, down, and 'x'; vector: left, right; number of engines enabled: number keys ("+prop.craft.engine_number.toString()+")",prop.canvas.size.width/2,prop.canvas.size.height-17);

  // crashed
  if(prop.craft.crashed)
    cc.fillText("you crashed a multimillion-dollar test rig. press 'r' to reset",prop.canvas.size.width/2,prop.canvas.size.height/2+5);

}

function canvas_update_post() {
  var cc=canvas_get("background");
  cc.save();
  canvas_draw_background(cc);
  cc.restore();

//  var cc=canvas_get("ground");
  cc.save();
//  canvas_clear(cc);
  canvas_draw_ground(cc);
  cc.restore();

//  var cc=canvas_get("pads");
  cc.save();
//  canvas_clear(cc);
  canvas_draw_pads(cc);
  cc.restore();

//  var cc=canvas_get("craft");
  cc.save();
//  canvas_clear(cc);
  canvas_draw_craft(cc);
  cc.restore();

//  var cc=canvas_get("hud");
  cc.save();
//  canvas_clear(cc);
  canvas_draw_hud(cc);
  cc.restore();
}
