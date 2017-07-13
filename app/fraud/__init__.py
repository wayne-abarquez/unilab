from flask import Blueprint

fraud = Blueprint('fraud', __name__)

from . import controllers
from . import resources
