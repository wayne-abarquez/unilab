"""empty message

Revision ID: 4e261c29d4f5
Revises: 351ae926fb50
Create Date: 2017-08-09 13:43:30.057433

"""

# revision identifiers, used by Alembic.
revision = '4e261c29d4f5'
down_revision = '351ae926fb50'

from alembic import op
import sqlalchemy as sa
import geoalchemy2


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user', sa.Column('empid', sa.Integer(), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user', 'empid')
    ### end Alembic commands ###
