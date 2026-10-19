"""Nigeria Lingua API: signup, login, lesson progress and quiz scores."""
import json
import os
import re
from datetime import date, timedelta

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
# Only your own frontend may call this API (3000 = Create React App, 5173 = Vite)
CORS(app, origins=["http://localhost:3000", "http://localhost:5173"])

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
# Set a real secret in production:  set SECRET_KEY=some-long-random-text
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-only-change-me")
db = SQLAlchemy(app)

serializer = URLSafeTimedSerializer(app.config["SECRET_KEY"])
TOKEN_MAX_AGE = 60 * 60 * 24 * 7  # 7 days
USERNAME_RE = re.compile(r"^[A-Za-z0-9_]{3,20}$")


# --- Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)  # stores a hash, never the plain password


class UserProgress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    language = db.Column(db.String(50), nullable=False)
    lesson = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), nullable=False)


class QuizScore(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    language = db.Column(db.String(50), nullable=False)
    score = db.Column(db.Integer, nullable=False)


class UserStats(db.Model):
    """One row per learner: XP, daily streak, today's XP and spaced-repetition cards."""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    xp = db.Column(db.Integer, default=0, nullable=False)
    streak = db.Column(db.Integer, default=0, nullable=False)
    best_streak = db.Column(db.Integer, default=0, nullable=False)
    last_day = db.Column(db.String(10))                         # "YYYY-MM-DD" of the last activity
    day_xp = db.Column(db.Integer, default=0, nullable=False)   # XP earned on last_day
    cards = db.Column(db.Text, default="{}", nullable=False)    # { wordId: { box, due } } as JSON


with app.app_context():
    db.create_all()


# --- Helpers ---
def make_token(username):
    return serializer.dumps({"u": username})


def current_user():
    """Returns the username from the Authorization: Bearer <token> header, or None."""
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    try:
        return serializer.loads(header[7:], max_age=TOKEN_MAX_AGE)["u"]
    except (BadSignature, SignatureExpired):
        return None


def unauthorized():
    return jsonify({"message": "Please log in again."}), 401


# --- Auth routes ---
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"message": "Missing username or password"}), 400
    if not USERNAME_RE.match(username):
        return jsonify({"message": "Username must be 3 to 20 letters, numbers or underscores"}), 400
    if len(password) < 8:
        return jsonify({"message": "Password must be at least 8 characters"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"message": "That username is taken"}), 400

    db.session.add(User(username=username, password=generate_password_hash(password)))
    db.session.commit()
    return jsonify({"message": "User registered successfully"}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"message": "Missing username or password"}), 400

    user = User.query.filter_by(username=username).first()
    ok = False
    if user:
        if user.password.startswith(("scrypt:", "pbkdf2:")):
            ok = check_password_hash(user.password, password)
        elif user.password == password:  # old account with a plain-text password
            user.password = generate_password_hash(password)  # upgrade it now
            db.session.commit()
            ok = True
    if not ok:
        return jsonify({"message": "Invalid credentials"}), 401

    return jsonify({"message": "Login successful", "user": username, "token": make_token(username)}), 200


# --- Progress routes (login required) ---
@app.route("/progress", methods=["POST"])
def save_progress():
    username = current_user()
    if not username:
        return unauthorized()

    data = request.get_json(silent=True) or {}
    language, lesson, status = data.get("language"), data.get("lesson"), data.get("status")
    if not all([language, lesson, status]):
        return jsonify({"message": "Missing fields"}), 400

    record = UserProgress.query.filter_by(username=username, language=language, lesson=lesson).first()
    if record:
        record.status = status
    else:
        db.session.add(UserProgress(username=username, language=language, lesson=lesson, status=status))
    db.session.commit()
    return jsonify({"message": "Progress saved successfully"}), 200


@app.route("/progress/<username>", methods=["GET"])
def get_progress(username):
    if current_user() != username:
        return unauthorized()

    result = {}
    for r in UserProgress.query.filter_by(username=username).all():
        result.setdefault(r.language, {})[r.lesson] = r.status
    return jsonify(result), 200


# --- Quiz scores (login required) ---
@app.route("/quiz-score", methods=["POST"])
def save_quiz_score():
    username = current_user()
    if not username:
        return unauthorized()

    data = request.get_json(silent=True) or {}
    language, score = data.get("language"), data.get("score")
    if not language or not isinstance(score, int):
        return jsonify({"message": "Missing language or score"}), 400

    record = QuizScore.query.filter_by(username=username, language=language).first()
    if record:
        record.score = score
    else:
        db.session.add(QuizScore(username=username, language=language, score=score))
    db.session.commit()
    return jsonify({"message": "Score saved"}), 200


@app.route("/quiz-score/<username>", methods=["GET"])
def get_quiz_scores(username):
    if current_user() != username:
        return unauthorized()
    return jsonify({q.language: q.score for q in QuizScore.query.filter_by(username=username).all()}), 200


# --- Stats: XP, streak, daily goal, review cards (login required) ---
DAILY_GOAL = 20


def clean_day(value):
    """The learner's local date as YYYY-MM-DD. Falls back to the server date."""
    try:
        return date.fromisoformat(value).isoformat()
    except (TypeError, ValueError):
        return date.today().isoformat()


def previous_day(day):
    return (date.fromisoformat(day) - timedelta(days=1)).isoformat()


def next_streak(last_day, streak, day):
    """Streak after activity on `day`: same day keeps it, the day after extends it, a gap resets to 1."""
    if last_day == day:
        return streak
    return streak + 1 if last_day == previous_day(day) else 1


def get_or_create_stats(username):
    stats = UserStats.query.filter_by(username=username).first()
    if not stats:
        stats = UserStats(username=username)
        db.session.add(stats)
        db.session.commit()
    return stats


def stats_payload(stats, day):
    alive = stats.last_day in (day, previous_day(day))  # a missed day already broke the streak
    return {
        "xp": stats.xp,
        "streak": stats.streak if alive else 0,
        "bestStreak": stats.best_streak,
        "todayXp": stats.day_xp if stats.last_day == day else 0,
        "goal": DAILY_GOAL,
        "cards": json.loads(stats.cards or "{}"),
    }


@app.route("/stats/<username>", methods=["GET"])
def get_stats(username):
    if current_user() != username:
        return unauthorized()
    return jsonify(stats_payload(get_or_create_stats(username), clean_day(request.args.get("day")))), 200


@app.route("/activity", methods=["POST"])
def record_activity():
    """Call after a lesson, quiz or review. Body: { day, xp, cards? }"""
    username = current_user()
    if not username:
        return unauthorized()

    data = request.get_json(silent=True) or {}
    day = clean_day(data.get("day"))
    xp = data.get("xp", 0)
    if not isinstance(xp, int) or not 0 <= xp <= 500:
        return jsonify({"message": "xp must be a whole number from 0 to 500"}), 400

    stats = get_or_create_stats(username)
    if stats.last_day != day:
        stats.day_xp = 0
    stats.streak = next_streak(stats.last_day, stats.streak, day)
    stats.last_day = day
    stats.best_streak = max(stats.best_streak, stats.streak)
    stats.day_xp += xp
    stats.xp += xp

    new_cards = data.get("cards")
    if isinstance(new_cards, dict):
        cards = json.loads(stats.cards or "{}")
        for word_id, c in list(new_cards.items())[:200]:
            if isinstance(c, dict) and isinstance(c.get("box"), int) and isinstance(c.get("due"), (int, float)):
                cards[str(word_id)] = {"box": c["box"], "due": c["due"]}
        stats.cards = json.dumps(cards)

    db.session.commit()
    return jsonify(stats_payload(stats, day)), 200


if __name__ == "__main__":
    app.run(debug=True)