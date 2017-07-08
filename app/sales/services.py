from .models import Branch
from app.home.models import Boundary
from sqlalchemy import select, func
from sqlalchemy.sql.expression import cast
from geoalchemy2 import Geography
from app import db


def get_branch_within_boundary(boundaryid):
    qt = select([Boundary.geometry]).select_from(Boundary).where(Boundary.id == boundaryid).alias('qt')

    stmt = select([Branch.id, Branch.type, Branch.name, Branch.latlng]) \
        .select_from(Branch) \
        .where(func.ST_DWITHIN(cast(qt.c.geom, Geography), cast(Branch.latlng, Geography), 1)) \
        .limit(500)

    return db.engine.execute(stmt).fetchall()


def get_branches_by_boundary(boundaryid=None):
    if boundaryid is None:
        return Branch.query.all()

    return get_branch_within_boundary(boundaryid)


def get_branches_with_limit(count=5):
    return Branch.query.limit(count).all()


def get_branches_id_with_limit(count=0):
    if count == 0: # get all
        return map(lambda idtup: idtup[0], db.session.query(Branch.id).all())
    else:
        return map(lambda idtup : idtup[0], db.session.query(Branch.id).limit(count).all())


def get_branches():
    return get_branches_by_boundary()
