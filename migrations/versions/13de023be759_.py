"""empty message

Revision ID: 13de023be759
Revises: 25825326551b
Create Date: 2017-07-12 01:43:56.425457

"""

# revision identifiers, used by Alembic.
revision = '13de023be759'
down_revision = '25825326551b'

from alembic import op
import sqlalchemy as sa
import geoalchemy2


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('transaction', sa.Column('end_point_latlng', geoalchemy2.types.Geometry(geometry_type='POINT'), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('transaction', 'end_point_latlng')
    ### end Alembic commands ###
