from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import random
import time
import datetime
import os

app = Flask(__name__)
CORS(app, origins="*")
