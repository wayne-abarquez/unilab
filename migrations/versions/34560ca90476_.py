"""empty message

Revision ID: 34560ca90476
Revises: 23172f77f714
Create Date: 2017-08-21 22:04:41.624139

"""

# revision identifiers, used by Alembic.
revision = '34560ca90476'
down_revision = '23172f77f714'

from alembic import op
import sqlalchemy as sa
import geoalchemy2


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.execute("""CREATE OR REPLACE FUNCTION scan_out_of_territory_fraud(useridparam INTEGER) RETURNS void AS $$
        DECLARE temprow record;
        BEGIN
            FOR temprow IN
                SELECT *
                FROM territory tr
                INNER JOIN user_territory ut
                ON tr.id = ut.territoryid
                WHERE ut.userid = useridparam
            LOOP
                UPDATE transaction
            SET status = 'FRAUD',
            remarks = 'Out of Territory'
            WHERE id IN (
            SELECT t.id
            FROM transaction t
            WHERE t.userid = useridparam
            AND ST_Disjoint(
                t.end_point_latlng::geometry,
                temprow.geom::geometry
                )
            );
            END LOOP;
        END;
        $$ LANGUAGE plpgsql""")

    op.execute("""CREATE OR REPLACE FUNCTION scan_on_leave_fraud(useridparam INTEGER)
                RETURNS void AS
                $$
                BEGIN
                    UPDATE transaction
                    SET status = 'FRAUD',
                        remarks = 'employee on leave'
                    WHERE id in (
                        SELECT t.id
                        FROM transaction t
                        WHERE
                        t.type != 'LEAVES' AND
                        t.userid = useridparam AND
                        to_char(t.transaction_date, 'YYYY-MM-DD')
                            IN (SELECT to_char(t1.transaction_date, 'YYYY-MM-DD')
                            FROM transaction t1
                            WHERE t1.userid = useridparam
                            AND t1.type = 'LEAVES')
                    );

                     END;
                 $$ LANGUAGE plpgsql;""")
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.execute('DROP FUNCTION IF EXISTS scan_out_of_territory_fraud(useridparam INTEGER)')
    op.execute('DROP FUNCTION IF EXISTS scan_on_leave_fraud(useridparam INTEGER)')
    ### end Alembic commands ###
