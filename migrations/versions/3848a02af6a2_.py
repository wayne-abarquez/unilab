"""empty message

Revision ID: 3848a02af6a2
Revises: 338b86e3337a
Create Date: 2017-07-08 12:38:03.358006

"""

# revision identifiers, used by Alembic.
revision = '3848a02af6a2'
down_revision = '338b86e3337a'

from alembic import op
import sqlalchemy as sa
import geoalchemy2


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.execute('ALTER TABLE branch ALTER COLUMN operation_started_date TYPE DATE')
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.execute('ALTER TABLE branch ALTER COLUMN operation_started_date TYPE DATETIME')
    ### end Alembic commands ###
