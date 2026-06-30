import os
import json
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
from backend.database.models import init_db, SessionLocal, User, ShotRecord
from backend.physics.engine import ShotSimulation

app = Flask(__name__)
CORS(app)

# Secret key for JWT signing
SECRET_KEY = os.environ.get("SECRET_KEY", "golfvision_super_secret_key_12345")

# Initialize database tables
with app.app_context():
    init_db()

# Middleware for Authentication
def token_required(f):
    def decorator(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({"message": "Token is missing"}), 401
            
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            db = SessionLocal()
            current_user = db.query(User).filter(User.id == data["user_id"]).first()
            db.close()
            if not current_user:
                return jsonify({"message": "User not found"}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Token is invalid"}), 401
            
        return f(current_user, *args, **kwargs)
    decorator.__name__ = f.__name__
    return decorator

# --- Authentication API ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({"message": "Username, email, and password are required"}), 400
        
    db = SessionLocal()
    existing_user = db.query(User).filter((User.username == username) | (User.email == email)).first()
    if existing_user:
        db.close()
        return jsonify({"message": "Username or email already exists"}), 400
        
    new_user = User(username=username, email=email)
    new_user.set_password(password)
    db.add(new_user)
    db.commit()
    user_dict = new_user.to_dict()
    db.close()
    
    return jsonify({"message": "User registered successfully", "user": user_dict}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400
        
    db = SessionLocal()
    user = db.query(User).filter(User.username == username).first()
    
    if not user or not user.check_password(password):
        db.close()
        return jsonify({"message": "Invalid username or password"}), 401
        
    # Generate Token
    token = jwt.encode({
        "user_id": user.id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, SECRET_KEY, algorithm="HS256")
    
    user_dict = user.to_dict()
    db.close()
    
    return jsonify({
        "token": token,
        "user": user_dict
    }), 200

@app.route('/api/auth/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify({"user": current_user.to_dict()}), 200

# --- Simulation API ---

def generate_ai_coach_feedback(sim, club):
    """
    Generates realistic feedback on the shot based on simulated trajectory and metrics.
    """
    # Heuristics based on club selection
    score = 100
    strengths = []
    weaknesses = []
    recommendation = ""
    expected_gain = 0
    
    # 1. Analyze smash factor (clubhead speed transfer)
    if sim.smash_factor >= 1.48:
        strengths.append("Excellent ball speed transfer (high Smash Factor).")
    elif sim.smash_factor < 1.40:
        weaknesses.append("Poor center-face contact (Smash Factor below 1.40).")
        score -= 10
        
    # 2. Analyze spin rate
    if club in ['Driver', 'Wood']:
        if sim.init_backspin_rpm > 3500:
            weaknesses.append("Excessive backspin for a Driver.")
            recommendation = "Lower your launch angle of attack or hit up on the ball to reduce spin."
            expected_gain += int((sim.init_backspin_rpm - 2400) * 0.008)
            score -= 15
        elif sim.init_backspin_rpm < 1800:
            weaknesses.append("Backspin is too low; ball may fall out of the air early.")
            recommendation = "Use a higher loft club or increase swing speed to maintain lift."
            score -= 10
        else:
            strengths.append("Optimal low-spin launch (excellent penetration).")
    elif club in ['7-Iron', '8-Iron', '9-Iron']:
        if sim.init_backspin_rpm < 5000:
            weaknesses.append("Iron spin is too low. The ball will struggle to hold the green.")
            recommendation = "Ensure clean turf interaction and downward attack angle."
            score -= 12
        else:
            strengths.append("Strong backspin, allowing excellent green-stopping control.")
            
    # 3. Analyze spin axis tilt (side spin / accuracy)
    tilt = sim.init_spin_angle
    if abs(tilt) > 15.0:
        weaknesses.append(f"Severe spin axis tilt ({abs(tilt):.1f}°), causing a heavy {'slice' if tilt > 0 else 'hook'}.")
        recommendation = "Adjust your clubface angle at impact relative to your swing path."
        score -= int(abs(tilt) * 1.5)
    elif abs(tilt) > 5.0:
        weaknesses.append(f"Moderate spin axis tilt, causing a {'fade' if tilt > 0 else 'draw'}.")
        score -= int(abs(tilt) * 0.5)
    else:
        strengths.append("Perfect straight ball flight (minimal side spin).")
        
    # 4. Analyze launch angle
    launch = sim.init_vertical_angle
    if club == 'Driver':
        if launch < 9.0:
            weaknesses.append("Launch angle is too low for maximum carry.")
            recommendation = "Tee the ball slightly higher and tilt your spine back at address."
            expected_gain += int((12.0 - launch) * 2.0)
            score -= 10
        elif launch > 16.0:
            weaknesses.append("Launch angle is too high, ballooning into the wind.")
            recommendation = "Deliver less dynamic loft at impact."
            score -= 8
        else:
            strengths.append("Great launch launch window.")
            
    # Make sure score is between 0 and 100
    score = max(0, min(100, score))
    
    if not recommendation:
        recommendation = "Keep practicing this swing signature to build consistency."
        
    return {
        "score": score,
        "strengths": strengths if strengths else ["Good baseline flight profile."],
        "weaknesses": weaknesses if weaknesses else ["No major flaws detected."],
        "recommendation": recommendation,
        "expectedGain": expected_gain
    }

def get_club_recommendation(distance_target):
    """
    Suggests the best club and parameters based on distance target in yards.
    """
    clubs = [
        {"club": "Driver", "range": (200, 320), "loft": 10.5, "speed": 105.0, "spin": 2500},
        {"club": "3-Wood", "range": (180, 240), "loft": 15.0, "speed": 98.0, "spin": 3200},
        {"club": "5-Wood", "range": (170, 220), "loft": 18.0, "speed": 94.0, "spin": 3600},
        {"club": "4-Iron", "range": (160, 200), "loft": 22.0, "speed": 88.0, "spin": 4500},
        {"club": "7-Iron", "range": (130, 170), "loft": 34.0, "speed": 82.0, "spin": 6500},
        {"club": "9-Iron", "range": (110, 140), "loft": 42.0, "speed": 76.0, "spin": 8000},
        {"club": "Wedge", "range": (50, 110), "loft": 52.0, "speed": 70.0, "spin": 9500}
    ]
    for c in clubs:
        if c["range"][0] <= distance_target <= c["range"][1]:
            return c
    return clubs[0] # Default Driver

@app.route('/api/simulate', methods=['POST'])
def simulate_shot():
    data = request.get_json() or {}
    
    # Map incoming frontend request names to ShotSimulation options
    options = {
        "mode": data.get("mode", "pro"),
        "initSpeedMPH": float(data.get("clubSpeed", 100.0)),
        "initVerticalAngleDegrees": float(data.get("launchAngle", 12.0)),
        "initHorizontalAngleDegrees": float(data.get("pathAngle", 0.0)),
        "initBackspinRPM": float(data.get("spinRate", 3000.0)),
        "initSpinAngle": float(data.get("spinTilt", 0.0)),
        "windSpeed": float(data.get("windSpeed", 0.0)),
        "windDir": float(data.get("windDir", 0.0)),
        "temp": float(data.get("temp", 70.0)),
        "humidity": float(data.get("humidity", 50.0)),
        "altitude": float(data.get("altitude", 0.0)),
        "terrain": data.get("terrain", "Fairway"),
        "smashFactor": float(data.get("smashFactor", 1.49)),
        "dt": float(data.get("dt", 0.001)),
        "stopOnImpact": data.get("stopOnImpact", False)
    }
    
    # Run the physics simulation
    sim = ShotSimulation(options)
    
    # Generate points (convert coordinates to dictionary format)
    points_dict = [p.to_dict() for p in sim.points]
    
    # Get feedback from AI Swing Coach
    club = data.get("clubUsed", "Driver")
    ai_coach = generate_ai_coach_feedback(sim, club)
    
    # Generate club recommendations
    target_dist = float(data.get("targetDistance", 250.0))
    club_rec = get_club_recommendation(target_dist)
    
    result = {
        "trajectory": points_dict,
        "carryDistance": sim.carry_distance,
        "totalDistance": sim.total_distance,
        "maxHeight": sim.max_height,
        "hangTime": sim.hang_time,
        "aiCoach": ai_coach,
        "clubRecommendation": club_rec
    }
    
    return jsonify(result), 200

# --- Saved Shots API ---

@app.route('/api/shots', methods=['POST'])
@token_required
def save_shot(current_user):
    data = request.get_json() or {}
    
    db = SessionLocal()
    shot = ShotRecord(
        user_id=current_user.id,
        club_used=data.get("clubUsed", "Driver"),
        club_speed=float(data.get("clubSpeed", 100.0)),
        launch_angle=float(data.get("launchAngle", 12.0)),
        path_angle=float(data.get("pathAngle", 0.0)),
        spin_rate=float(data.get("spinRate", 3000.0)),
        spin_tilt=float(data.get("spinTilt", 0.0)),
        wind_speed=float(data.get("windSpeed", 0.0)),
        wind_dir=float(data.get("windDir", 0.0)),
        temp=float(data.get("temp", 70.0)),
        humidity=float(data.get("humidity", 50.0)),
        altitude=float(data.get("altitude", 0.0)),
        terrain=data.get("terrain", "Fairway"),
        carry_distance=float(data.get("carryDistance", 0.0)),
        total_distance=float(data.get("totalDistance", 0.0)),
        max_height=float(data.get("maxHeight", 0.0)),
        hang_time=float(data.get("hangTime", 0.0)),
        trajectory_json=json.dumps(data.get("trajectory", []))
    )
    db.add(shot)
    db.commit()
    shot_dict = shot.to_dict()
    db.close()
    
    return jsonify({"message": "Shot saved successfully", "shot": shot_dict}), 201

@app.route('/api/shots', methods=['GET'])
@token_required
def get_shots(current_user):
    db = SessionLocal()
    shots = db.query(ShotRecord).filter(ShotRecord.user_id == current_user.id).order_by(ShotRecord.created_at.desc()).all()
    shots_list = [s.to_dict() for s in shots]
    db.close()
    
    return jsonify({"shots": shots_list}), 200

@app.route('/api/shots/<int:shot_id>', methods=['DELETE'])
@token_required
def delete_shot(current_user, shot_id):
    db = SessionLocal()
    shot = db.query(ShotRecord).filter(ShotRecord.id == shot_id, ShotRecord.user_id == current_user.id).first()
    
    if not shot:
        db.close()
        return jsonify({"message": "Shot record not found"}), 404
        
    db.delete(shot)
    db.commit()
    db.close()
    
    return jsonify({"message": "Shot record deleted successfully"}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
