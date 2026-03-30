RESTAURANT = {
    "name": "El Pancho",
    "name_jp": "エルパンチョ",
    "tagline": "Osaka's most beloved Mexican restaurant since 1979",
    "address": "1-10-1 Shinsaibashisuji, Chuo-ku, Osaka 542-0085 (8F Shinsaibashi Tower Building)",
    "phone": "06-6241-0588",
    "access": "Take elevator near UNIQLO Shinsaibashi to 8F. Exit 10 from Shinsaibashi Station.",
    "hours": {
        "Monday": "11:30 - 23:30",
        "Tuesday": "11:30 - 23:30",
        "Wednesday": "11:30 - 23:30",
        "Thursday": "11:30 - 23:30",
        "Friday": "11:30 - 23:30",
        "Saturday": "11:30 - 23:30",
        "Sunday": "11:30 - 23:30"
    },
    "last_order": "23:00",
    "happy_hour": {
        "weekday": "17:00 - 20:00 (Mon-Fri)",
        "weekend": "15:00 - 18:00 (Sat-Sun)",
        "deals": [
            "Corona Beer: ¥750 → ¥460",
            "Draft Beer: ¥750 → ¥460",
            "Margarita Glass: ¥790 → ¥460",
            "Margarita Grande: ¥1,500 → ¥900"
        ]
    },
    "menu": {
        "Tacos": [
            {"name": "Spicy Pork Taco", "name_jp": "スパイシーポークタコス", "price": "¥1,400", "description": "El Pancho 40-year bestseller", "vegetarian": False},
            {"name": "Roast Chicken Taco", "name_jp": "ローストチキンタコス", "price": "¥1,400", "description": "Tender marinated chicken", "vegetarian": False},
            {"name": "Beef Taco", "name_jp": "ビーフタコス", "price": "¥1,600", "description": "Seasoned grilled beef", "vegetarian": False},
            {"name": "Avocado Taco", "name_jp": "アボカドタコス", "price": "¥1,400", "description": "Fresh avocado, beans, salsa", "vegetarian": True}
        ],
        "Mains": [
            {"name": "Carne Asada", "name_jp": "カルネアサダ", "price": "¥1,700", "description": "Marinated grilled beef with guacamole and beans", "vegetarian": False},
            {"name": "Spare Ribs", "name_jp": "スペアリブ", "price": "¥1,600", "description": "Tender fall-off-the-bone ribs", "vegetarian": False},
            {"name": "Enchiladas", "name_jp": "エンチラーダ", "price": "¥1,500", "description": "Rolled tortillas with meat and chili sauce", "vegetarian": False},
            {"name": "Quesadilla", "name_jp": "ケサディーヤ", "price": "¥1,400", "description": "Grilled tortilla with cheese and filling", "vegetarian": False},
            {"name": "Burrito", "name_jp": "ブリトー", "price": "¥1,500", "description": "Flour tortilla with rice, beans, meat and salsa", "vegetarian": False},
            {"name": "Vegetarian & Healthy Set", "name_jp": "ベジタリアン＆ヘルシーセット", "price": "¥1,500", "description": "Fresh vegetable plate", "vegetarian": True}
        ],
        "Salads": [
            {"name": "Mexican Salad Tostadas", "name_jp": "メキシカンサラダトスターダス", "price": "¥1,300", "description": "Fried tortilla with beans, guacamole, chicken, sour cream", "vegetarian": False},
            {"name": "Avocado Salad", "name_jp": "アボカドサラダ", "price": "¥1,200", "description": "Fresh avocado salad", "vegetarian": True},
            {"name": "Pancho Salad Special", "name_jp": "パンチョスペシャルサラダ", "price": "¥1,600", "description": "Mega salad with eggs, bacon, chicken, avocado, potatoes", "vegetarian": False}
        ],
        "Drinks": [
            {"name": "Yuzu Margarita", "name_jp": "柚子マルガリータ", "price": "¥900", "description": "Japanese citrus twist — highly recommended"},
            {"name": "Margarita Glass", "name_jp": "マルガリータ（グラス）", "price": "¥790 (Happy Hour: ¥460)", "description": "Classic tequila cocktail"},
            {"name": "Margarita Pitcher S", "name_jp": "マルガリータ ピッチャーS", "price": "¥1,300", "description": "Perfect for sharing"},
            {"name": "Corona Beer", "name_jp": "コロナビール", "price": "¥750 (Happy Hour: ¥460)", "description": "Mexican lager"},
            {"name": "Homemade Sangria", "name_jp": "手作りサングリア", "price": "¥700", "description": "House favourite — staff highly recommend"}
        ]
    },
    "faqs": [
        "Reservations strongly recommended — we fill up fast on weekends",
        "Open every day — no regular holidays",
        "Located on 8F — take elevator near UNIQLO, our entrance is immediately visible",
        "English menu available for international guests",
        "Groups up to 8 people can book online — larger groups please call us",
        "We accept credit cards and PayPay",
        "Vegetarian options available",
        "Walk-ins may be asked to leave after 90 minutes when busy",
        "Parking: street parking and coin lots nearby on Nagahori-dori",
        "Kids are very welcome — we are a family-friendly restaurant. High chairs available on request.",
    ],
    "vibe": "warm, lively, festive Mexican atmosphere. Dimly lit with colourful decor. Casual but proud of 45 years of history. Welcoming to tourists and locals.",
    "ai_name": "Pancho",
    "total_tables": 8
}

DEFAULT_BOOKING_SETTINGS = {
    "slot_interval_mins": 30,
    "buffer_mins": 15,
    "duration_rules": [
        {"max_party": 2, "duration_mins": 90},
        {"max_party": 4, "duration_mins": 120},
        {"max_party": 6, "duration_mins": 150},
        {"max_party": 99, "duration_mins": 180}
    ],
    "min_advance_mins": 120,
    "max_advance_days": 30,
    "max_party_online": 8,
    "cancel_deadline_hrs": 2,
    "weekly_schedule": {
        "monday":    {"open": "11:30", "close": "23:30"},
        "tuesday":   {"open": "11:30", "close": "23:30"},
        "wednesday": {"open": "11:30", "close": "23:30"},
        "thursday":  {"open": "11:30", "close": "23:30"},
        "friday":    {"open": "11:30", "close": "23:30"},
        "saturday":  {"open": "11:30", "close": "23:30"},
        "sunday":    {"open": "11:30", "close": "23:30"}
    },
    "special_dates": {}
}

DEFAULT_TABLES = [
    {"table_id": "T1", "capacity": 2, "label": "Window",    "combinable_with": ["T2"]},
    {"table_id": "T2", "capacity": 2, "label": "Window",    "combinable_with": ["T1"]},
    {"table_id": "T3", "capacity": 4, "label": "Centre",    "combinable_with": ["T4"]},
    {"table_id": "T4", "capacity": 4, "label": "Centre",    "combinable_with": ["T3"]},
    {"table_id": "T5", "capacity": 4, "label": "Bar",       "combinable_with": []},
    {"table_id": "T6", "capacity": 6, "label": "Booth",     "combinable_with": ["T7"]},
    {"table_id": "T7", "capacity": 6, "label": "Booth",     "combinable_with": ["T6"]},
    {"table_id": "T8", "capacity": 8, "label": "Long table","combinable_with": []}
]
