import math
import numpy as np

def get_air_density(temp_f=70.0, humidity_pct=50.0, altitude_ft=0.0):
    """
    Calculates the air density (kg/m^3) based on temperature, relative humidity, and altitude.
    Uses the dry air and vapor pressure formulas for high accuracy.
    """
    # Convert temperature to Kelvin
    temp_c = (temp_f - 32.0) * 5.0 / 9.0
    temp_k = temp_c + 273.15
    
    # Convert altitude from feet to meters
    alt_m = altitude_ft * 0.3048
    
    # Calculate air pressure at altitude using barometric formula
    # P = P0 * (1 - L*h/T0)^(g*M / R*L)
    p0 = 101325.0  # Sea level standard pressure in Pa
    t0 = 288.15    # Sea level standard temperature in K
    l_lapse = 0.0065 # Temperature lapse rate (K/m)
    g = 9.80665    # Gravity m/s^2
    m_mol = 0.0289644 # Molar mass of dry air (kg/mol)
    r_gas = 8.31447  # Universal gas constant (J/(mol*K))
    
    exponent = (g * m_mol) / (r_gas * l_lapse)
    pressure = p0 * math.pow((1.0 - (l_lapse * alt_m) / t0), exponent)
    
    # Saturation vapor pressure of water using Tetens equation (in Pa)
    # p_sat = 610.78 * e^(17.27 * Tc / (Tc + 237.3))
    p_sat = 610.78 * math.exp(17.27 * temp_c / (temp_c + 237.3))
    
    # Actual vapor pressure
    p_v = (humidity_pct / 100.0) * p_sat
    
    # Partial pressure of dry air
    p_d = pressure - p_v
    
    # Specific gas constants
    r_d = 287.058 # J/(kg*K) for dry air
    r_v = 461.495 # J/(kg*K) for water vapor
    
    # Density of humid air
    # rho = p_d / (R_d * T) + p_v / (R_v * T)
    rho = (p_d / (r_d * temp_k)) + (p_v / (r_v * temp_k))
    
    return rho

def get_wind_vector(wind_speed_mph, wind_dir_degrees):
    """
    Calculates the 3D wind velocity vector in m/s.
    wind_dir_degrees is the direction the wind is blowing FROM relative to the target line (positive Z).
    0 degrees = Headwind (wind blowing along -Z, i.e., towards the golfer)
    180 degrees = Tailwind (wind blowing along +Z, i.e., away from the golfer)
    90 degrees = Right-to-left crosswind (wind blowing along -X)
    270 degrees = Left-to-right crosswind (wind blowing along +X)
    """
    # Convert wind speed to m/s (1 mph = 0.44704 m/s)
    wind_speed_mps = wind_speed_mph * 0.44704
    
    # Convert direction to radians
    # We want to represent the direction the wind is blowing TO.
    # If it blows FROM 0 deg (headwind), the vector is (0, 0, -1).
    # If it blows FROM 180 deg (tailwind), the vector is (0, 0, 1).
    # If it blows FROM 90 deg (R-to-L), the vector is (-1, 0, 0).
    # If it blows FROM 270 deg (L-to-R), the vector is (1, 0, 0).
    theta_rad = math.radians(wind_dir_degrees)
    
    wx = -wind_speed_mps * math.sin(theta_rad)
    wy = 0.0
    wz = -wind_speed_mps * math.cos(theta_rad)
    
    return np.array([wx, wy, wz])
