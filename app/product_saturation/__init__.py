from flask import Blueprint

product_saturation = Blueprint('product_saturation', __name__)

from . import controllers
from . import resources