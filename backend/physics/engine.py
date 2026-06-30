import math
import numpy as np
from backend.physics.environment import get_air_density, get_wind_vector

class Vector3D:
    """
    A helper 3D vector class to mirror THREE.Vector3 behavior and math.
    """
    def __init__(self, x=0.0, y=0.0, z=0.0):
        self.x = float(x)
        self.y = float(y)
        self.z = float(z)
        
    def to_np(self):
        return np.array([self.x, self.y, self.z])
        
    @staticmethod
    def from_np(arr):
        return Vector3D(arr[0], arr[1], arr[2])
        
    def clone(self):
        return Vector3D(self.x, self.y, self.z)
        
    def add(self, other):
        self.x += other.x
        self.y += other.y
        self.z += other.z
        return self
        
    def multiply_scalar(self, scalar):
        self.x *= scalar
        self.y *= scalar
        self.z *= scalar
        return self
        
    def length(self):
        return math.sqrt(self.x**2 + self.y**2 + self.z**2)
        
    def normalize(self):
        l = self.length()
        if l > 0:
            self.x /= l
            self.y /= l
            self.z /= l
        return self
        
    def negate(self):
        self.x = -self.x
        self.y = -self.y
        self.z = -self.z
        return self
        
    def cross(self, other):
        # self x other
        cx = self.y * other.z - self.z * other.y
        cy = self.z * other.x - self.x * other.z
        cz = self.x * other.y - self.y * other.x
        return Vector3D(cx, cy, cz)

    def to_dict(self):
        return {"x": self.x, "y": self.y, "z": self.z}


class ShotPoint:
    def __init__(self, time=0.0, position=None, velocity=None, angular_velocity=None, acceleration=None):
        self.time = time
        self.position = position if position else Vector3D()
        self.velocity = velocity if velocity else Vector3D()
        self.angular_velocity = angular_velocity if angular_velocity else Vector3D()
        self.acceleration = acceleration if acceleration else Vector3D()
        
    def clone(self):
        return ShotPoint(
            time=self.time,
            position=self.position.clone(),
            velocity=self.velocity.clone(),
            angular_velocity=self.angular_velocity.clone(),
            acceleration=self.acceleration.clone()
        )
        
    def to_dict(self):
        return {
            "time": self.time,
            "position": self.position.to_dict(),
            "velocity": self.velocity.to_dict(),
            "angularVelocity": self.angular_velocity.to_dict(),
            "speed": self.velocity.length(),
            "spin": self.angular_velocity.length()
        }


class ShotSimulation:
    def __init__(self, options=None):
        options = options or {}
        
        # Mode: 'pro' or 'legacy'
        self.mode = options.get('mode', 'pro')
        self.stop_on_impact = options.get('stopOnImpact', False)
        
        # Ball Properties
        self.mass = 0.0459  # kg (from 1.62 ounces)
        self.diameter = 0.04267  # meters (1.68 inches)
        
        if self.mode == 'legacy':
            self.cross_sectional_area = 0.04267 * math.pi / 4  # legacy incorrect formula: D * pi / 4
        else:
            self.cross_sectional_area = math.pi * (self.diameter / 2.0)**2  # correct: pi * R^2 (~0.00143 m^2)
            
        self.smash_factor = options.get('smashFactor', 1.49)
        self.dt = options.get('dt', 0.001)  # simulation step (seconds)
        
        # Nature & Environment
        self.gravity = -9.8  # m/s^2 (downward)
        
        # Advanced Environment Setup (Pro mode)
        self.temp_f = options.get('temp', 70.0)
        self.humidity = options.get('humidity', 50.0)
        self.altitude = options.get('altitude', 0.0)
        self.terrain = options.get('terrain', 'Fairway')
        
        if self.mode == 'legacy':
            self.air_density = 1.2041  # kg/m^3 standard
            self.wind_vector = np.array([0.0, 0.0, 0.0])
        else:
            self.air_density = get_air_density(self.temp_f, self.humidity, self.altitude)
            wind_speed = options.get('windSpeed', 0.0)
            wind_dir = options.get('windDir', 0.0)
            self.wind_vector = get_wind_vector(wind_speed, wind_dir)
            
        # Aerodynamics Coefficients
        self.drag_coeff = options.get('dragCoefficient', 0.4)
        self.lift_coeff = options.get('liftCoefficient', 0.00001 if self.mode == 'legacy' else 0.2)
        self.spin_decay_constant = options.get('spinDecayRateConstant', 23) if self.mode == 'legacy' else 0.04  # s^-1
        
        # Initial Shot Attributes
        self.init_speed_mph = options.get('initSpeedMPH', 100.0)
        self.init_vertical_angle = options.get('initVerticalAngleDegrees', 12.0)
        self.init_horizontal_angle = options.get('initHorizontalAngleDegrees', 0.0)
        self.init_backspin_rpm = options.get('initBackspinRPM', 3000.0)
        self.init_spin_angle = options.get('initSpinAngle', 0.0)  # Spin axis tilt (deg)
        
        # Results
        self.points = []
        self.carry_distance = 0.0  # yards
        self.total_distance = 0.0  # yards
        self.max_height = 0.0  # yards
        self.hang_time = 0.0  # seconds
        
        # Run Simulation
        self.run()

    def get_initial_spin(self, spin_rpm, spin_angle_deg):
        """
        Returns initial spin angular velocity Vector3D in rad/s.
        """
        spin = Vector3D(0.0, 0.0, 0.0)
        spin.x = -1.0  # Full backspin revolves around negative X axis
        spin.y = math.sin(math.radians(spin_angle_deg))
        
        # Convert RPM to rad/s (1 RPM = 2*pi/60 rad/s)
        rad_s = spin_rpm * 2.0 * math.pi / 60.0
        spin.normalize().multiply_scalar(rad_s)
        return spin

    def get_initial_velocity(self, speed_mph, smash_factor, vert_deg, horiz_deg):
        """
        Returns initial velocity Vector3D in m/s.
        """
        velocity = Vector3D()
        velocity.x = math.sin(-1.0 * math.radians(horiz_deg))
        velocity.y = math.sin(math.radians(vert_deg))
        velocity.z = math.cos(math.radians(vert_deg))
        
        # Ball speed in m/s (1 mph = 0.44704 m/s)
        ball_speed_mps = speed_mph * smash_factor * 0.44704
        
        velocity.normalize().multiply_scalar(ball_speed_mps)
        return velocity

    def run(self):
        # Create initial point
        init_point = ShotPoint(time=0.0)
        init_point.position = Vector3D(0.0, 0.0, 0.0)
        init_point.velocity = self.get_initial_velocity(
            self.init_speed_mph, self.smash_factor, self.init_vertical_angle, self.init_horizontal_angle
        )
        init_point.angular_velocity = self.get_initial_spin(self.init_backspin_rpm, self.init_spin_angle)
        
        # Start simulation loop
        last_point = init_point.clone()
        self.points.append(last_point)
        
        t = 0.0
        is_rolling = False
        
        # Ground parameters for different terrains
        # (restitution, friction, rolling resistance)
        terrain_presets = {
            'Fairway': (0.45, 0.20, 0.08),
            'Rough': (0.15, 0.55, 0.25),
            'Sand': (0.05, 0.85, 0.70),
            'Wet Grass': (0.30, 0.35, 0.12)
        }
        restitution, friction, roll_resistance = terrain_presets.get(self.terrain, (0.45, 0.20, 0.08))
        
        # Carry is recorded on first impact with the ground (y <= 0)
        carry_recorded = False
        
        max_steps = int(25.0 / self.dt)
        while len(self.points) < max_steps:  # Safe cap scaled to dt (allows up to 25 seconds of flight/roll)
            t += self.dt
            new_point = last_point.clone()
            new_point.time = t
            
            if not is_rolling:
                # 1. Flight equations (Euler/RK2)
                accel = self.get_acceleration(last_point)
                new_point.acceleration = accel
                
                # Update velocity and position
                new_point.velocity.add(accel.clone().multiply_scalar(self.dt))
                new_point.position.add(new_point.velocity.clone().multiply_scalar(self.dt))
                
                # Spin decay
                decay = self.get_spin_decay(last_point)
                new_point.angular_velocity.add(decay)
                
                # Check ground impact
                if new_point.position.y <= 0.0:
                    new_point.position.y = 0.0
                    
                    if not carry_recorded:
                        # Record carry distance (z-coordinate converted to yards)
                        # We interpolate to find exactly where y=0
                        ratio = -last_point.position.y / (new_point.position.y - last_point.position.y) if (new_point.position.y - last_point.position.y) != 0 else 1.0
                        exact_z = last_point.position.z + ratio * (new_point.position.z - last_point.position.z)
                        self.carry_distance = exact_z * 1.09361 # meters to yards
                        self.hang_time = t
                        carry_recorded = True
                    
                    if self.stop_on_impact:
                        new_point.velocity.x = 0.0
                        new_point.velocity.y = 0.0
                        new_point.velocity.z = 0.0
                        self.points.append(new_point)
                        break
                    
                    # Bounce check
                    # If vertical velocity is still significant, bounce!
                    if abs(new_point.velocity.y) > 0.8:
                        # Bounce: reverse Vy, apply restitution, apply friction to Vx and Vz
                        new_point.velocity.y = -restitution * new_point.velocity.y
                        new_point.velocity.x = (1.0 - friction) * new_point.velocity.x
                        new_point.velocity.z = (1.0 - friction) * new_point.velocity.z
                        
                        # Reduce spin slightly upon impact
                        new_point.angular_velocity.multiply_scalar(0.7)
                    else:
                        # Transition to rolling
                        is_rolling = True
                        new_point.velocity.y = 0.0
            else:
                # 2. Rolling equations
                # Decelerate horizontally due to rolling resistance
                speed_xz = math.sqrt(new_point.velocity.x**2 + new_point.velocity.z**2)
                if speed_xz > 0.1:
                    decel_mag = roll_resistance * 9.8
                    dec_vx = -decel_mag * (new_point.velocity.x / speed_xz)
                    dec_vz = -decel_mag * (new_point.velocity.z / speed_xz)
                    
                    new_point.velocity.x += dec_vx * self.dt
                    new_point.velocity.z += dec_vz * self.dt
                    new_point.position.x += new_point.velocity.x * self.dt
                    new_point.position.z += new_point.velocity.z * self.dt
                    
                    # Spin decays very quickly during rolling
                    new_point.angular_velocity.multiply_scalar(math.exp(-15.0 * self.dt))
                else:
                    new_point.velocity.x = 0.0
                    new_point.velocity.z = 0.0
                    self.points.append(new_point)
                    break
            
            self.points.append(new_point)
            last_point = new_point
            
        # Compile summary stats
        self.total_distance = self.points[-1].position.z * 1.09361 # meters to yards
        
        # Max height during flight
        max_h_m = max(p.position.y for p in self.points)
        self.max_height = max_h_m * 1.09361 # meters to yards
        
        if not carry_recorded:
            self.carry_distance = self.total_distance
            self.hang_time = t

    def get_acceleration(self, point):
        """
        Calculates acceleration vector (Vector3D) including gravity, drag, and Magnus forces.
        """
        gravity_accel = Vector3D(0.0, self.gravity, 0.0)
        
        # Relative velocity to wind
        v_np = point.velocity.to_np()
        v_rel = v_np - self.wind_vector
        v_rel_len = np.linalg.norm(v_rel)
        
        if v_rel_len < 0.01:
            return gravity_accel
            
        # Velocity unit vector
        v_rel_unit = v_rel / v_rel_len
        
        if self.mode == 'legacy':
            # Legacy simple drag and lift math
            # Drag coefficient speed dependent
            adjusted_cd = self.drag_coeff * min(1.0, 14.0 / point.velocity.length()) if point.velocity.length() > 0 else self.drag_coeff
            # Drag accel = Cd * rho * A / mass * V^2 in opposite direction
            drag_f_accel = point.velocity.clone().multiply_scalar(-1.0 * adjusted_cd * self.air_density * self.cross_sectional_area / self.mass)
            
            # Magnus force = lift_coeff * (omega x V) / mass
            magnus_f_accel = point.angular_velocity.cross(point.velocity).multiply_scalar(self.lift_coeff / self.mass)
            
            return Vector3D(0.0, 0.0, 0.0).add(gravity_accel).add(drag_f_accel).add(magnus_f_accel)
            
        else:
            # Pro mode Advanced equations
            # Spin parameter: S = (omega * R) / V
            omega_rad_s = point.angular_velocity.length()
            r_ball = self.diameter / 2.0
            spin_parameter = (omega_rad_s * r_ball) / v_rel_len if v_rel_len > 0 else 0
            
            # Drag coefficient Cd model (incorporating drag crisis and spin)
            cd = 0.22 + 0.24 / (1.0 + math.exp((v_rel_len - 18.0) / 5.0)) + 0.08 * spin_parameter
            
            # Drag force: Fd = 0.5 * Cd * rho * A * V_rel^2
            drag_force_mag = 0.5 * cd * self.air_density * self.cross_sectional_area * (v_rel_len**2)
            drag_accel_np = -drag_force_mag * v_rel_unit / self.mass
            
            # Lift coefficient Cl model (adapted from Bearman & Harvey)
            # Cl increases with spin parameter, saturated at ~0.45
            cl = 0.15 + 0.35 * spin_parameter
            if cl > 0.45:
                cl = 0.45
                
            # Magnus Force: Fm = 0.5 * Cl * rho * A * V_rel^2 * (omega_hat x V_rel_hat)
            magnus_accel_np = np.zeros(3)
            if omega_rad_s > 0:
                omega_unit = point.angular_velocity.to_np() / omega_rad_s
                lift_dir = np.cross(omega_unit, v_rel_unit)
                magnus_force_mag = 0.5 * cl * self.air_density * self.cross_sectional_area * (v_rel_len**2)
                magnus_accel_np = magnus_force_mag * lift_dir / self.mass
                
            total_accel_np = gravity_accel.to_np() + drag_accel_np + magnus_accel_np
            return Vector3D.from_np(total_accel_np)

    def get_spin_decay(self, point):
        """
        Calculates spin rate decay vector per time step.
        """
        if self.mode == 'legacy':
            decay = point.angular_velocity.clone()
            return decay.normalize().negate().multiply_scalar(self.spin_decay_constant * self.dt)
        else:
            # Pro exponential decay: d_omega = -k * omega * dt
            # Spin decay constant is ~0.04 per second
            decay = point.angular_velocity.clone().multiply_scalar(-self.spin_decay_constant * self.dt)
            return decay
