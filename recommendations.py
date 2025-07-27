import pandas as pd
import numpy as np
import json
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from collections import defaultdict
import os
from collections import defaultdict, Counter


class Recommendations:
    def __init__(self, products_df, interactions_df):
        self.products_df = products_df.copy()
        self.interactions_df = interactions_df.copy()

        self.interaction_weight_file = "config/interaction_weights.json"
        self.interaction_weights = self.load_or_initialize_interaction_weights()

        self.attribute_columns = ["brand", "category", "subcategory", "material"]
        self.weight_file = "config/dynamic_history_weights.json"
        self.global_attribute_weights = self.load_or_initialize_weights()

        self.config_file = "config/config.json"
        self.load_config()

        self._prepare()

    def load_or_initialize_weights(self):
        if os.path.exists(self.weight_file):
            with open(self.weight_file, "r") as f:
                return json.load(f)
        else:
            return {attr: 1.0 for attr in self.attribute_columns}

    def load_or_initialize_interaction_weights(self):
        default_weights = {
            "purchase": 5,
            "add_to_cart": 3,
            "wishlist": 2,
            "compare": 2,
            "view": 1,
            "search": 1,
        }

        if os.path.exists(self.interaction_weight_file):
            try:
                with open(self.interaction_weight_file, "r") as f:
                    return json.load(f)
            except Exception as e:
                print(f"Failed to load interaction weights: {e}")
                return default_weights
        else:
            return default_weights

    def save_weights(self):
        with open(self.weight_file, "w") as f:
            json.dump(self.global_attribute_weights, f)

    def _prepare(self):
        # Check if products_df is empty
        if self.products_df.empty:
            print("⚠️ Warning: Products DataFrame is empty. Recommendations will not work.")
            return
            
        # Check if required columns exist
        missing_columns = [col for col in self.attribute_columns if col not in self.products_df.columns]
        if missing_columns:
            print(f"⚠️ Warning: Missing columns in products table: {missing_columns}")
            print(f"Available columns: {list(self.products_df.columns)}")
            return
            
        self.products_df.fillna("", inplace=True)
        self.products_df["combined"] = self.products_df[self.attribute_columns].agg(
            " ".join, axis=1
        )

        self.vectorizer = TfidfVectorizer()
        self.tfidf_matrix = self.vectorizer.fit_transform(self.products_df["combined"])

    def get_product_to_product_recommendations(self, product_id, top_n=5):
        if self.products_df.empty:
            return f"No products available in database."
            
        if product_id not in self.products_df["product_id"].values:
            return f"Product {product_id} not found."

        # Load weights directly inside the function
        weights_path = os.path.join("config", "product_to_product_weights.json")
        if os.path.exists(weights_path):
            with open(weights_path, "r") as f:
                ptp_weights = json.load(f)
        else:
            ptp_weights = {
                col: 1 for col in ["brand", "category", "subcategory", "material"]
            }

        idx = self.products_df.index[
            self.products_df["product_id"] == product_id
        ].tolist()[0]

        cosine_similarities = cosine_similarity(
            self.tfidf_matrix[idx], self.tfidf_matrix
        ).flatten()

        similar_indices = cosine_similarities.argsort()[::-1][
            1 : top_n * 5
        ]  # More candidates for filtering

        base_product = self.products_df.iloc[idx]
        candidates = self.products_df.iloc[similar_indices].copy()

        def weighted_score(row):
            score = 0
            for attr in ["brand", "category", "subcategory", "material"]:
                if base_product[attr] == row[attr]:
                    score += ptp_weights.get(attr, 1)
            return score

        candidates["match_score"] = candidates.apply(weighted_score, axis=1)
        candidates = candidates.sort_values(
            by=["match_score", "price"], ascending=[False, True]
        )

        print("Scores are: ", ptp_weights)

        return candidates.head(top_n)[
            [
                "product_id",
                "product_name",
                "brand",
                "category",
                "subcategory",
                "material",
                "price",
                "image_url",
                "product_url",
            ]
        ]

    def get_price_based_recommendations(self, product_id, top_n=5):
        if self.products_df.empty:
            return f"No products available in database."
            
        if product_id not in self.products_df["product_id"].values:
            return f"Product {product_id} not found."

        target_price = self.products_df.loc[
            self.products_df["product_id"] == product_id, "price"
        ].values[0]

        self.products_df["price_diff"] = abs(self.products_df["price"] - target_price)

        top_products = (
            self.products_df[self.products_df["product_id"] != product_id]
            .sort_values("price_diff")
            .head(top_n)
        )

        return top_products[
            [
                "product_id",
                "product_name",
                "brand",
                "category",
                "subcategory",
                "material",
                "price",
                "image_url",
                "product_url",
            ]
        ]

    def get_user_to_user_recommendations(self, user_id, top_n=5):
        if user_id not in self.interactions_df["user_id"].values:
            return f"User {user_id} has no interactions."

        user_item_matrix = self.interactions_df.pivot_table(
            index="user_id",
            columns="product_id",
            values="interaction_type",
            aggfunc=lambda x: sum(self.interaction_weights.get(i, 0) for i in x),
        ).fillna(0)

        if user_id not in user_item_matrix.index:
            return f"User {user_id} has no interactions after processing."

        similarities = cosine_similarity(
            [user_item_matrix.loc[user_id]], user_item_matrix
        )[0]

        similar_users = user_item_matrix.index[similarities.argsort()[::-1][1:]]

        user_interacted = set(
            self.interactions_df[self.interactions_df["user_id"] == user_id][
                "product_id"
            ]
        )

        recommendations = defaultdict(float)

        for other_user in similar_users:
            other_interactions = self.interactions_df[
                self.interactions_df["user_id"] == other_user
            ]
            for _, row in other_interactions.iterrows():
                if row["product_id"] not in user_interacted:
                    weight = self.interaction_weights.get(row["interaction_type"], 0)
                    recommendations[row["product_id"]] += weight

        recommended_ids = sorted(
            recommendations.items(), key=lambda x: x[1], reverse=True
        )[:top_n]

        return self.products_df[
            self.products_df["product_id"].isin([i[0] for i in recommended_ids])
        ][
            [
                "product_id",
                "product_name",
                "brand",
                "category",
                "subcategory",
                "material",
                "price",
                "image_url",
                "product_url",
            ]
        ]

    def load_config(self):
        try:
            with open("config/config.json", "r") as f:
                config = json.load(f)
                self.alpha = config.get("alpha", 0.7)  # default to 0.7 if not found
        except FileNotFoundError:
            print("⚠️ config.json not found. Using default alpha = 0.7")
            self.alpha = 0.7

    def get_history_based_weighted_recommendations(self, user_id, top_n=5):

        if user_id not in self.interactions_df["user_id"].values:
            return f"User {user_id} has no interactions."

        user_interactions = self.interactions_df[
            self.interactions_df["user_id"] == user_id
        ]
        product_ids = user_interactions["product_id"].unique()

        relevant_products = self.products_df[
            self.products_df["product_id"].isin(product_ids)
        ]

        # Step 1: Count frequencies of attribute values from interaction history
        value_match_counts = {attr: Counter() for attr in self.attribute_columns}

        for _, interaction in user_interactions.iterrows():
            pid = interaction["product_id"]
            interaction_type = interaction["interaction_type"]
            interaction_weight = self.interaction_weights.get(interaction_type, 0)

            product = self.products_df[self.products_df["product_id"] == pid].iloc[0]

            for attr in self.attribute_columns:
                val = product.get(attr)
                if val:
                    value_match_counts[attr][val] += interaction_weight

        # Step 2: Score attributes by total frequency of their repeated values
        match_counts = {}
        for attr in self.attribute_columns:
            # match_counts[attr] = sum(value_match_counts[attr].values()) # generic
            match_counts[attr] = sum(
                [v**2 for v in value_match_counts[attr].values()]
            )  # favors repeated values

        print("🔍 Attribute value match counts:")
        for attr, counter in value_match_counts.items():
            print(f"{attr}: {dict(counter)}")

        print("📊 Match counts (summed):", match_counts)

        total = sum(match_counts.values())

        if total > 0:
            for attr in self.attribute_columns:
                new_weight = match_counts[attr] / total
                self.global_attribute_weights[attr] = round(
                    self.alpha * self.global_attribute_weights[attr]
                    + (1 - self.alpha) * new_weight,
                    3,
                )
            self.save_weights()
            print("✅ Updated global attribute weights:", self.global_attribute_weights)
        else:
            print(
                "⚠️ No attribute match contributions found — global weights not updated."
            )

        # Step 3: Score all products based on attribute matches
        scores = []
        for _, product in self.products_df.iterrows():
            score = 0.0
            for attr in self.attribute_columns:
                if attr in product and product[attr] in relevant_products[attr].values:
                    score += self.global_attribute_weights[attr]
            scores.append(score)

        self.products_df["history_score"] = scores

        recommended = (
            self.products_df[~self.products_df["product_id"].isin(product_ids)]
            .sort_values("history_score", ascending=False)
            .head(top_n)
        )

        return recommended[
            [
                "product_id",
                "product_name",
                "brand",
                "category",
                "subcategory",
                "material",
                "price",
                "image_url",
                "product_url",
            ]
        ]

    def get_static_history_based_recommendations(self, user_id, top_n=5):
        if user_id not in self.interactions_df["user_id"].values:
            return f"User {user_id} has no interactions."

        # Load static weights from external JSON file
        try:
            with open("config/static_history_weights.json", "r") as f:
                static_weights = json.load(f)
        except FileNotFoundError:
            return "❌ static_history_weights.json not found."
        except json.JSONDecodeError:
            return "❌ Failed to parse static_history_weights.json."

        # Ensure all required attributes are in the static weights
        for attr in self.attribute_columns:
            if attr not in static_weights:
                return f"❌ Missing weight for attribute: {attr} in static_history_weights.json"

        user_interactions = self.interactions_df[
            self.interactions_df["user_id"] == user_id
        ]
        product_ids = user_interactions["product_id"].unique()

        relevant_products = self.products_df[
            self.products_df["product_id"].isin(product_ids)
        ]

        # Score all products based on static attribute matches
        scores = []
        for _, product in self.products_df.iterrows():
            score = 0.0
            for attr in self.attribute_columns:
                if attr in product and product[attr] in relevant_products[attr].values:
                    score += static_weights[attr]
            scores.append(score)

        self.products_df["static_history_score"] = scores

        recommended = (
            self.products_df[~self.products_df["product_id"].isin(product_ids)]
            .sort_values("static_history_score", ascending=False)
            .head(top_n)
        )

        return recommended[
            [
                "product_id",
                "product_name",
                "brand",
                "category",
                "subcategory",
                "material",
                "price",
                "image_url",
                "product_url",
            ]
        ]

    def get_best_sellers(self, top_n=5):
        try:
            top_products = (
                self.interactions_df["product_id"]
                .value_counts()
                .head(top_n)
                .index.tolist()
            )

            best_sellers = self.products_df[
                self.products_df["product_id"].isin(top_products)
            ].copy()

            best_sellers["rank"] = best_sellers["product_id"].apply(
                lambda x: top_products.index(x)
            )
            best_sellers = best_sellers.sort_values("rank").drop(columns="rank")

            # Return as DataFrame (like other methods)
            return best_sellers[
                [
                    "product_id",
                    "product_name",
                    "brand",
                    "category",
                    "subcategory",
                    "material",
                    "price",
                    "image_url",
                    "product_url",
                ]
            ]

        except Exception as e:
            return f"Error getting best sellers: {e}"


class HybridRecommender:
    def __init__(self, recommender):
        self.recommender = recommender

    def recommend(self, user_id=None, product_id=None, rec_type="hybrid", top_n=10):
        if rec_type == "history" and user_id:
            return self.get_history_based_recommendations(user_id, top_n)
        elif rec_type == "hybrid" and user_id:
            return self.get_hybrid_recommendations(user_id, top_n)
        elif rec_type == "product" and product_id:
            return self.get_product_based_recommendations(product_id, top_n)
        elif rec_type == "price" and product_id:
            return self.get_price_based_recommendations(product_id, top_n)
        else:
            return self.get_fallback_recommendations(top_n)

    def get_hybrid_recommendations(self, user_id, product_id=None, top_n=10):
        # Step 1: Try history-based recommendations
        history_recs = self.recommender.get_history_based_weighted_recommendations(
            user_id, top_n=top_n
        )

        if isinstance(history_recs, str) or history_recs.empty:
            # Step 2: If history fails, try collaborative filtering
            user_user_recs = self.recommender.get_user_to_user_recommendations(
                user_id, top_n=top_n
            )

            if isinstance(user_user_recs, str) or user_user_recs.empty:
                # Step 3: If CF also fails, fallback to best sellers
                return self.recommender.get_best_sellers(top_n=top_n)
            else:
                return user_user_recs

        return history_recs
