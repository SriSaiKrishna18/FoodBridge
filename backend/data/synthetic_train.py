"""
Synthetic Training Data Generator for FoodBridge
Generates demo data and seeds the database
"""
import random
import math
from datetime import datetime, timedelta


# Chennai area coordinates for realistic demo
CHENNAI_LOCATIONS = [
    {"name": "T. Nagar",        "lat": 13.0418, "lng": 80.2341, "type": "restaurant"},
    {"name": "Adyar",           "lat": 13.0067, "lng": 80.2572, "type": "restaurant"},
    {"name": "Anna Nagar",      "lat": 13.0850, "lng": 80.2101, "type": "caterer"},
    {"name": "Velachery",       "lat": 12.9815, "lng": 80.2180, "type": "hotel"},
    {"name": "Mylapore",        "lat": 13.0368, "lng": 80.2676, "type": "restaurant"},
    {"name": "Thiruvanmiyur",   "lat": 12.9830, "lng": 80.2594, "type": "caterer"},
    {"name": "Guindy",          "lat": 13.0067, "lng": 80.2206, "type": "canteen"},
    {"name": "Tambaram",        "lat": 12.9249, "lng": 80.1000, "type": "restaurant"},
    {"name": "Porur",           "lat": 13.0382, "lng": 80.1564, "type": "hotel"},
    {"name": "Chromepet",       "lat": 12.9516, "lng": 80.1462, "type": "caterer"},
    {"name": "Sholinganallur",  "lat": 12.9010, "lng": 80.2279, "type": "canteen"},
    {"name": "OMR",             "lat": 12.9200, "lng": 80.2300, "type": "restaurant"},
]

RECEIVER_LOCATIONS = [
    {"name": "Hope Foundation",       "lat": 13.0500, "lng": 80.2400, "org": "NGO"},
    {"name": "Chennai Food Bank",     "lat": 13.0100, "lng": 80.2500, "org": "Food Bank"},
    {"name": "Annadhanam Trust",      "lat": 13.0800, "lng": 80.2200, "org": "Trust"},
    {"name": "Street Children Aid",   "lat": 12.9900, "lng": 80.2300, "org": "NGO"},
    {"name": "Elders Care Home",      "lat": 13.0300, "lng": 80.2700, "org": "Care Home"},
    {"name": "Community Kitchen",     "lat": 12.9600, "lng": 80.2100, "org": "Community"},
    {"name": "Youth Welfare Assoc.",   "lat": 13.0700, "lng": 80.2000, "org": "Association"},
    {"name": "Sakthi Orphanage",      "lat": 12.9400, "lng": 80.1500, "org": "Orphanage"},
]

FOOD_ITEMS = [
    {"title": "Leftover biryani from wedding",           "desc": "Veg and chicken biryani, freshly prepared", "cat": "cooked",  "qty": 15.0, "serves": 50},
    {"title": "Bread and pastries from bakery",          "desc": "Assorted bread loaves and pastries",        "cat": "bakery",  "qty": 8.0,  "serves": 30},
    {"title": "Fresh fruits and vegetables",             "desc": "Bananas, apples, tomatoes, carrots",        "cat": "fruits_vegetables", "qty": 20.0, "serves": 40},
    {"title": "Packed lunch meals unused",               "desc": "Rice, sambar, curd rice — 25 packets",      "cat": "cooked",  "qty": 12.0, "serves": 25},
    {"title": "Dairy products nearing expiry",           "desc": "Milk packets and curd",                     "cat": "dairy",   "qty": 10.0, "serves": 20},
    {"title": "Rotis and sabzi from canteen",            "desc": "Chapati with paneer and dal",               "cat": "cooked",  "qty": 6.0,  "serves": 20},
    {"title": "Packaged snacks from event",              "desc": "Chips, biscuits, juice boxes",              "cat": "packaged","qty": 5.0,  "serves": 30},
    {"title": "Rice and dal from restaurant",            "desc": "Plain rice, dal fry, pickle",               "cat": "cooked",  "qty": 10.0, "serves": 35},
    {"title": "Wedding catering surplus",                "desc": "Multiple items: rice, curry, dessert",      "cat": "cooked",  "qty": 25.0, "serves": 80},
    {"title": "Idli and dosa batter",                    "desc": "Fresh batter, enough for 100 idlis",        "cat": "cooked",  "qty": 5.0,  "serves": 25},
    {"title": "Fresh juice and smoothies",               "desc": "Mango, orange, and mixed fruit juice",      "cat": "beverages","qty": 8.0, "serves": 30},
    {"title": "Cakes from birthday party",               "desc": "Chocolate and vanilla cakes, cut portions", "cat": "bakery",  "qty": 4.0,  "serves": 15},
]


def generate_seed_data():
    """Generate seed data for demo purposes."""
    return {
        "donors": CHENNAI_LOCATIONS,
        "receivers": RECEIVER_LOCATIONS,
        "food_items": FOOD_ITEMS,
    }
