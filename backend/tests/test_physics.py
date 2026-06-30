import unittest
import math
from backend.physics.engine import ShotSimulation

class TestPhysicsEngine(unittest.TestCase):

    def test_basic_trajectory_30mph_30deg(self):
        """
        Verify trajectory with no lift or drag matches the theoretical calculations.
        For a 30mph shot, 30deg vertical launch, dt=0.0001, smashFactor=1.0.
        """
        options = {
            "mode": "legacy",  # either pro or legacy is fine since Cd=Cl=0
            "initSpeedMPH": 30.0,
            "initVerticalAngleDegrees": 30.0,
            "initHorizontalAngleDegrees": 0.0,
            "initBackspinRPM": 0.0,
            "initSpinAngle": 0.0,
            "dragCoefficient": 0.0,
            "liftCoefficient": 0.0,
            "dt": 0.0001,
            "smashFactor": 1.0,
            "stopOnImpact": True
        }
        
        sim = ShotSimulation(options)
        
        # Test initial velocity
        first_point = sim.points[0]
        # Expected: Vx=0.0, Vy=6.7056 (30 * 0.44704 * sin(30)), Vz=11.61443 (30 * 0.44704 * cos(30))
        self.assertAlmostEqual(first_point.velocity.x, 0.0, places=2)
        self.assertAlmostEqual(first_point.velocity.y, 6.7056, places=2)
        self.assertAlmostEqual(first_point.velocity.z, 11.61443, places=2)
        
        # Test flight time
        # Expected: ~1.368s
        # Number of points = time / dt
        expected_points = 1.368 / 0.0001
        self.assertTrue(abs(len(sim.points) - expected_points) / expected_points < 0.01) # within 1%
        
        # Test final distance
        # Expected distance: 15.89m
        last_point = sim.points[-1]
        self.assertTrue(abs(last_point.position.z - 15.89) / 15.89 < 0.01) # within 1%
        
        # Test max height
        # Expected max height: 2.294m
        max_actual_height = max(p.position.y for p in sim.points)
        self.assertTrue(abs(max_actual_height - 2.294) / 2.294 < 0.01)

    def test_basic_trajectory_150mph_12deg(self):
        """
        Verify trajectory with no lift or drag matches the theoretical calculations.
        For a 150mph shot, 12deg vertical launch, dt=0.0001, smashFactor=1.0.
        """
        options = {
            "mode": "legacy",
            "initSpeedMPH": 150.0,
            "initVerticalAngleDegrees": 12.0,
            "initHorizontalAngleDegrees": 0.0,
            "initBackspinRPM": 0.0,
            "initSpinAngle": 0.0,
            "dragCoefficient": 0.0,
            "liftCoefficient": 0.0,
            "dt": 0.0001,
            "smashFactor": 1.0,
            "stopOnImpact": True
        }
        
        sim = ShotSimulation(options)
        
        # Test initial velocity
        first_point = sim.points[0]
        self.assertAlmostEqual(first_point.velocity.x, 0.0, places=2)
        self.assertAlmostEqual(first_point.velocity.y, 13.9417, places=2)
        self.assertAlmostEqual(first_point.velocity.z, 65.5906, places=2)
        
        # Test final distance
        # Expected distance: 186.62m
        last_point = sim.points[-1]
        self.assertTrue(abs(last_point.position.z - 186.62) / 186.62 < 0.01)
        
        # Test max height
        # Expected: 9.9169m
        max_actual_height = max(p.position.y for p in sim.points)
        self.assertTrue(abs(max_actual_height - 9.9169) / 9.9169 < 0.01)

    def test_trackman_comparison_legacy(self):
        """
        Runs a legacy simulation with drag/lift to ensure it runs correctly
        and computes valid output.
        """
        options = {
            "mode": "legacy",
            "initSpeedMPH": 112.0,
            "initVerticalAngleDegrees": 11.2,
            "initBackspinRPM": 2685.0,
            "smashFactor": 1.49,
            "initHorizontalAngleDegrees": 0.0,
            "initSpinAngle": 0.0,
            "dt": 0.001
        }
        
        sim = ShotSimulation(options)
        # Ensure it simulates a flight path, rolls, and calculates distance
        self.assertTrue(sim.carry_distance > 0)
        self.assertTrue(sim.total_distance > sim.carry_distance)
        self.assertTrue(sim.max_height > 0)
        self.assertTrue(sim.hang_time > 0)
        
    def test_pro_simulation_wind_impact(self):
        """
        Verify that wind affects the trajectory in Pro mode.
        """
        options_no_wind = {
            "mode": "pro",
            "initSpeedMPH": 100.0,
            "initVerticalAngleDegrees": 12.0,
            "initBackspinRPM": 3000.0,
            "windSpeed": 0.0,
            "windDir": 0.0,
            "dt": 0.001
        }
        sim_no_wind = ShotSimulation(options_no_wind)
        
        options_headwind = {
            "mode": "pro",
            "initSpeedMPH": 100.0,
            "initVerticalAngleDegrees": 12.0,
            "initBackspinRPM": 3000.0,
            "windSpeed": 20.0,  # 20 mph headwind
            "windDir": 0.0,     # 0 degrees = headwind
            "dt": 0.001
        }
        sim_headwind = ShotSimulation(options_headwind)
        
        options_crosswind = {
            "mode": "pro",
            "initSpeedMPH": 100.0,
            "initVerticalAngleDegrees": 12.0,
            "initBackspinRPM": 3000.0,
            "windSpeed": 20.0,  # 20 mph crosswind
            "windDir": 90.0,    # 90 degrees = blowing right-to-left (towards negative X)
            "dt": 0.001
        }
        sim_crosswind = ShotSimulation(options_crosswind)
        
        # Headwind should reduce total distance compared to no wind
        self.assertTrue(sim_headwind.total_distance < sim_no_wind.total_distance)
        
        # Crosswind (R-to-L) should push the ball to the left (negative X)
        self.assertTrue(sim_crosswind.points[-1].position.x < sim_no_wind.points[-1].position.x)

if __name__ == "__main__":
    unittest.main()
