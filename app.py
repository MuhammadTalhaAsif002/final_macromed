from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine
import pandas as pd
import json
import os

from recommendations import Recommendations, HybridRecommender

# Flask setup
app = Flask(__name__)
CORS(app)

# Load database configuration
def load_db_config():
    config_file = "config/database_config.json"
    if os.path.exists(config_file):
        with open(config_file, 'r') as f:
            return json.load(f)
    else:
        # Fallback to default configuration
        return {
            "host": "localhost",
            "port": 5432,
            "user": "postgres",
            "password": "12345",
            "database": "Macromed"
        }

# PostgreSQL DB config
db_config = load_db_config()
host = db_config["host"]
port = db_config["port"]
user = db_config["user"]
password = db_config["password"]
database = db_config["database"]

# Connect to PostgreSQL
engine = create_engine(
    f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}"
)

# Load product and interaction data
print("🔍 Attempting to connect to PostgreSQL database...")
print(f"📊 Database config: {host}:{port}, user: {user}, database: {database}")

try:
    # Test connection first
    with engine.connect() as connection:
        print("✅ Database connection successful!")
        
    # Load products
    print("📦 Loading products table...")
    products_df = pd.read_sql("SELECT * FROM products", engine)
    print(f"✅ Loaded {len(products_df)} products")
    
    # Load interactions
    print("🔄 Loading interactions table...")
    interactions_df = pd.read_sql("SELECT * FROM interactions", engine)
    print(f"✅ Loaded {len(interactions_df)} interactions")
    
except Exception as e:
    print(f"❌ Error loading tables: {e}")
    print(f"🔍 Error type: {type(e).__name__}")
    print(f"🔍 Error details: {str(e)}")
    products_df = pd.DataFrame()
    interactions_df = pd.DataFrame()

# Initialize recommendation engines
rec = Recommendations(products_df, interactions_df)
hybrid = HybridRecommender(rec)

# Weight file configurations
WEIGHT_FILES = {
    "dynamic_history": "config/dynamic_history_weights.json",
    "product_to_product": "config/product_to_product_weights.json", 
    "static_history": "config/static_history_weights.json",
    "interaction": "config/interaction_weights.json",
    "config": "config/config.json"
}

@app.route("/api/weights/<weight_type>", methods=["GET"])
def get_weights(weight_type):
    """Get weights for a specific type"""
    if weight_type not in WEIGHT_FILES:
        return jsonify({"error": "Invalid weight type"}), 400

    file_path = WEIGHT_FILES[weight_type]
    try:
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                weights = json.load(f)
            return jsonify(weights)
        else:
            return jsonify({"error": "Weight file not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Error reading weights: {str(e)}"}), 500

@app.route("/api/weights/<weight_type>", methods=["PUT"])
def update_weights(weight_type):
    """Update weights for a specific type"""
    if weight_type not in WEIGHT_FILES:
        return jsonify({"error": "Invalid weight type"}), 400
    
    file_path = WEIGHT_FILES[weight_type]
    try:
        new_weights = request.json
        if not isinstance(new_weights, dict):
            return jsonify({"error": "Invalid weights format"}), 400
        
        # Load weight limits for validation
        limits_file = "config/weight_limits.json"
        weight_limits = {}
        if os.path.exists(limits_file):
            try:
                with open(limits_file, 'r') as f:
                    weight_limits = json.load(f)
            except Exception as e:
                print(f"Error loading weight limits: {e}")
        
        # Validate weights against limits
        validation_errors = []
        if weight_type in weight_limits:
            limits = weight_limits[weight_type]
            if weight_type == "config":
                # Special handling for config (alpha value)
                if "alpha" in new_weights:
                    alpha_limits = limits.get("alpha", {})
                    alpha_value = new_weights["alpha"]
                    if not isinstance(alpha_value, (int, float)):
                        validation_errors.append("Alpha value must be a number")
                    elif alpha_value < alpha_limits.get("min", 0):
                        validation_errors.append(f"Alpha value must be >= {alpha_limits.get('min', 0)}")
                    elif alpha_value > alpha_limits.get("max", 1):
                        validation_errors.append(f"Alpha value must be <= {alpha_limits.get('max', 1)}")
            else:
                # Regular weight validation
                min_val = limits.get("min", 0)
                max_val = limits.get("max", 10)
                for key, value in new_weights.items():
                    if not isinstance(value, (int, float)):
                        validation_errors.append(f"{key} must be a number")
                    elif value < min_val:
                        validation_errors.append(f"{key} must be >= {min_val}")
                    elif value > max_val:
                        validation_errors.append(f"{key} must be <= {max_val}")
        
        if validation_errors:
            return jsonify({"error": "Validation failed", "details": validation_errors}), 400
        
        # Ensure config directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Write the new weights
        with open(file_path, 'w') as f:
            json.dump(new_weights, f, indent=2)
        
        return jsonify({"message": "Weights updated successfully", "weights": new_weights})
    except Exception as e:
        return jsonify({"error": f"Error updating weights: {str(e)}"}), 500

@app.route("/api/weights", methods=["GET"])
def list_weight_types():
    """List all available weight types"""
    # Load weight limits
    limits_file = "config/weight_limits.json"
    weight_limits = {}
    if os.path.exists(limits_file):
        try:
            with open(limits_file, 'r') as f:
                weight_limits = json.load(f)
        except Exception as e:
            print(f"Error loading weight limits: {e}")
    
    return jsonify({
        "weight_types": list(WEIGHT_FILES.keys()),
        "descriptions": {
            "dynamic_history": "Weights for dynamic history-based recommendations",
            "product_to_product": "Weights for product-to-product similarity",
            "static_history": "Weights for static history-based recommendations", 
            "interaction": "Weights for different user interaction types",
            "config": "General configuration parameters (alpha value for dynamic history)"
        },
        "limits": weight_limits
    })


@app.route("/api/recommend", methods=["GET"])
def recommend():
    rec_type = request.args.get(
        "type", "content"
    )  # content, price, cf, history, hybrid, static_history

    # Recommendations that require user_id
    if rec_type in ["cf", "history", "hybrid", "static_history"]:
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400
        try:
            user_id = int(user_id)
        except ValueError:
            return jsonify({"error": "Invalid user_id"}), 400

        if rec_type == "cf":
            df = rec.get_user_to_user_recommendations(user_id)
        elif rec_type == "history":
            df = rec.get_history_based_weighted_recommendations(user_id)
        elif rec_type == "static_history":
            df = rec.get_static_history_based_recommendations(user_id)
        elif rec_type == "hybrid":
            df = hybrid.recommend(user_id)
        else:
            return jsonify({"error": "Invalid type"}), 400

        if isinstance(df, str):
            return jsonify({"error": df}), 404
        return jsonify(df.to_dict(orient="records"))

    # Recommendations that require product_id
    product_id = request.args.get("product_id")
    if not product_id:
        return jsonify({"error": "Missing product_id"}), 400
    try:
        product_id = int(product_id)
    except ValueError:
        return jsonify({"error": "Invalid product_id"}), 400

    if rec_type == "content":
        df = rec.get_product_to_product_recommendations(product_id)
    elif rec_type == "price":
        df = rec.get_price_based_recommendations(product_id)
    else:
        return jsonify({"error": "Invalid type"}), 400

    if isinstance(df, str):
        return jsonify({"error": df}), 404
    return jsonify(df.to_dict(orient="records"))


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify(
        {
            "status": "ok",
            "products_loaded": len(products_df),
            "interactions_loaded": len(interactions_df),
        }
    )


if __name__ == "__main__":
    app.run(debug=True, port=5001)
