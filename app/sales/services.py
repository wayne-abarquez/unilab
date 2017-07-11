from app import db
from .models import Branch, BranchStatus, Product, BranchProduct
from app.home.models import Boundary
from sqlalchemy import select, func
from sqlalchemy.sql.expression import cast
from app.utils.response_transformer import to_dict
from geoalchemy2 import Geography
from app.utils import forms_helper


def get_branch_within_boundary(boundaryid):
    qt = select([Boundary.geometry]).select_from(Boundary).where(Boundary.id == boundaryid).alias('qt')

    stmt = select([Branch.id, Branch.type, Branch.name, Branch.latlng]) \
        .select_from(Branch) \
        .where(func.ST_DWITHIN(cast(qt.c.geometry, Geography), cast(Branch.latlng, Geography), 1)) \
        .limit(500)

    result = db.engine.execute(stmt).fetchall()

    modresult = []

    for item in result:
        modresult.append({'branchid': item.id, 'boundaryid': boundaryid, 'branch': item});

    return modresult


def get_branches_by_boundary(boundaryid=None):
    if boundaryid is None:
        return Branch.query.all()

    return get_branch_within_boundary(boundaryid)


def get_branches_with_limit(count=5):
    if count == 0:
        return Branch.query.all()
    else:
        return Branch.query.limit(count).all()


def get_branches_id_with_limit(count=0):
    if count == 0: # get all
        return map(lambda idtup: idtup[0], db.session.query(Branch.id).all())
    else:
        return map(lambda idtup : idtup[0], db.session.query(Branch.id).limit(count).all())


def get_branches():
    return get_branches_by_boundary()


def get_products():
    return Product.query.all()


def get_products_by_branch(branchid):
    result = db.session.query(BranchProduct, Product) \
        .join(Product, BranchProduct.productid == Product.id) \
        .filter(BranchProduct.branchid == branchid) \
        .all()

    rp = []

    for tp in result:
        itm = to_dict(tp[0])
        itm.update({'product': to_dict(tp[1])})
        rp.append(itm)

    return rp


def create_branch(data):
    print "create branch: {0}".format(data)
    # Prepare Data
    branch = Branch.from_dict(data)
    branch.status = BranchStatus.ACTIVE
    branch.latlng = forms_helper.parse_coordinates(data['latlng'])

    # Persist
    db.session.add(branch)
    db.session.commit()

    return branch
