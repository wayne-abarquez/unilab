"""empty message

Revision ID: 351ae926fb50
Revises: 217ce1046981
Create Date: 2017-08-01 12:07:28.988260

"""

# revision identifiers, used by Alembic.
revision = '351ae926fb50'
down_revision = '217ce1046981'

from alembic import op
import sqlalchemy as sa
import geoalchemy2


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.create_index('idx_branchid_productid', 'branch_product', ['branchid', 'productid'], unique=True)
    op.create_index('idx_date_released', 'branch_product', ['date_released'], unique=False)
    op.create_index('idx_product_name', 'product', ['name'], unique=True)
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('idx_branchid_productid', table_name='branch_product')
    op.drop_index('idx_date_released', table_name='branch_product')
    op.drop_index('idx_product_name', table_name='product')
    ### end Alembic commands ###
