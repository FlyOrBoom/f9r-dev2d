
var Craft=function(options) {
  this.pos=[0,0];
  this.angle=0;

  this.g_force=0;

  this.autopilot={
    enabled: false
  };
  
  this.reset=function() {
    this.start=time()

    this.crashed=false;

    this.mass=18000;
    this.mass=21000;
    this.fuel=80000;
//    this.fuel=350000;

    this.throttle=0;

    this.engine_number=3;

    this.rocket_body.position=[0,26.05];
    this.rocket_body.velocity=[0,0];
    this.rocket_body.angle=0;
    this.rocket_body.angularVelocity=0;

    this.offset=trange(0,this.fuel,this.full_fuel,this.mass_distribution[0],this.mass_distribution[1]);
    this.rocket_body.position[1]=26.1-this.offset;

    this.update();
  };

  this.full_fuel=350000;
  // kg of thrust
  this.thrust_peak=[6540,7160];

  // kg of fuel per second of a single engine at sea level and in a vacuum
  this.fuel_flow=[1500,1350];
  
  // max engine vector
  this.vector_max=radians(5);

  this.min_throttle=0.7;
  this.max_throttle=1.03;

  this.thrust=0;
  this.thrust_vector=0; // angle in radians

  this.engine_number=3;

  this.rocket_body=new p2.Body({
    position: [0,30],
    angle: 0.01,
    mass: 1
  });
  
  this.rocket_shape=new p2.Rectangle(3.66, 42);
  this.rocket_body.addShape(this.rocket_shape);

  this.mass_distribution=[2,20];

  this.leg_offset=-24;

  this.right_leg_shape=new p2.Rectangle(2, 0.5);
  this.left_leg_shape=new p2.Rectangle(2, 0.5);
  this.rocket_body.addShape(this.right_leg_shape,[-6.5,this.leg_offset]);
  this.rocket_body.addShape(this.left_leg_shape,[6.5,this.leg_offset]);

  this.rocket_body.updateBoundingRadius();

  this.gearDown=true;
//  this.setGear();

  prop.physics.world.addBody(this.rocket_body);

  this.setGear=function() {

  };

  this.updateMass=function() {
    this.rocket_body.mass=(this.mass+this.fuel)*0.01;
    this.offset=trange(0,this.fuel,this.full_fuel,this.mass_distribution[0],this.mass_distribution[1]);
    this.rocket_body.shapeOffsets[0][1]=this.offset;
    for(var i=1;i<this.rocket_body.shapeOffsets.length;i++) {
      this.rocket_body.shapeOffsets[i][1]=this.leg_offset+this.offset;
    }
    this.rocket_body.updateMassProperties();
    this.rocket_body.damping=crange(0,this.getAltitude(),100000,0.1,0.0);
    this.rocket_body.angular_damping=crange(0,this.getAltitude(),100000,0.1,0.0);
  };
  
  this.getAltitude=function() {
    return this.pos[1]-this.offset-8;
  };

  this.updateAutopilot=function() {
    return;
    if(!this.autopilot.enabled) return;
    this.engine_number=3;

    this.autopilot.target_altitude=1
    this.autopilot.target_vspeed=crange(-1,this.getAltitude()-this.autopilot.target_altitude,1,-0.5,0.5);

    this.throttle+=crange(-1,this.autopilot.target_vspeed,1,-1*delta(),1*delta());
  };

  this.updateFuel=function() {
    var single_engine_fuel_flow=trange(0,this.getAltitude(),100000,this.fuel_flow[0],this.fuel_flow[1]);
    var fuel_flow=single_engine_fuel_flow*this.throttle*this.engine_number*delta();
    this.fuel-=fuel_flow;
    this.fuel=Math.max(0,this.fuel);
  };

  this.updateThrust=function() {
    this.thrust_vector=clamp(-1,this.thrust_vector,1);
    var throttle=trange(0,this.throttle,1,this.min_throttle,this.max_throttle);
    if(this.throttle <= 0.01) throttle=0;
    this.thrust=trange(0,this.getAltitude(),100000,this.thrust_peak[0],this.thrust_peak[1])*this.engine_number*throttle;
    if(this.fuel <= 0) this.thrust=0;
    var v=(this.thrust_vector*this.vector_max)+this.angle;
    var force=[-sin(v)*this.thrust,cos(v)*this.thrust];
    var point=[0,0];
    this.rocket_body.toWorldFrame(point,[0,-22]);
    this.rocket_body.applyForce(force,point);
  };

  this.updateLocal=function() {
    this.pos=this.rocket_body.position;
    this.angle=normalizeAngle(this.rocket_body.angle);
    this.g_force=distance([0,0],this.rocket_body.force)*0.001;
  };

  this.updateCrash=function() {
    if(time()-this.start < 2) return; // do not crash in the first few seconds
    if(this.rocket_body.overlaps(prop.physics.ground_body)) { // touching ground
      if(distance([0,0],this.rocket_body.velocity) > 2) {
        this.crashed=true;
      }
      var angle=normalizeAngle(this.rocket_body.angle+Math.PI);
      if(Math.abs(angle-Math.PI) > radians(10)) this.crashed=true;
    }
    if(this.crashed) {
      this.throttle=0;
    }
  }

  this.update=function() {
    this.throttle=clamp(0,this.throttle,1);
    this.updateCrash();
    this.updateAutopilot();
    this.updateFuel();
    this.updateMass();
    this.updateThrust();
    this.updateLocal();
  };

  this.reset();

};

function craft_init_pre() {
  prop.craft=new Craft();
}

function craft_update() {
  prop.craft.update();
}

function craft_reset() {
  prop.craft.reset();
}