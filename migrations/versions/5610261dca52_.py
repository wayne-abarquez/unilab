"""empty message

Revision ID: 5610261dca52
Revises: 2ff2b8ee8d86
Create Date: 2017-07-13 23:52:07.738778

"""

# revision identifiers, used by Alembic.
revision = '5610261dca52'
down_revision = '2ff2b8ee8d86'

from alembic import op
import sqlalchemy as sa
import geoalchemy2


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.create_index('idx_merchant_name_address', 'merchant', ['name', 'address'], unique=True)
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('idx_merchant_name_address', table_name='merchant')
    ### end Alembic commands ###
