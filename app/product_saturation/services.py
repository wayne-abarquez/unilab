from app import db
from app.sales.models import Product


def get_product_distinct_types():
    return Product.query.distinct(Product.type).order_by(Product.name).all()


def create_product(data):
    # Prepare Data
    obj = Product.from_dict(data)

    # Persist
    db.session.add(obj)
    db.session.commit()

    return obj


def get_products():
    return Product.query.order_by(Product.name).all()
