from app import app, db
from openpyxl import load_workbook
from sqlalchemy import Column, String, Integer, MetaData, Table, ForeignKey
from app.sales.models import Transaction
from app.authentication.models import User
from unicodedata import normalize
from app.sales.services import create_transaction, create_merchant
import re
from datetime import datetime
import logging

log = logging.getLogger(__name__)

engine = db.engine
# engine = db.get_engine(app)

_punct_re = re.compile(r'[\t !"#$%&\'()*\-/<=>?@\[\\\]^_`{|},.]+')


def slugify(text, delim=u'_'):
    """Generates an slightly worse ASCII-only slug."""
    result = []
    for word in _punct_re.split(text.lower()):
        word = normalize('NFKD', word).encode('ascii', 'ignore')
        if word:
            result.append(word)
    return unicode(delim.join(result))


def clean_date(datestr):
    dateext = datestr[2:24]
    return datetime.strptime(dateext, "%m/%d/%Y-%I:%M:%S %p")


def create_table_name(name, prefix='transaction'):
    return prefix + '_' + name.lower()


user_id_columns = ['emp id', 'employeeid', 'employee id', 'empid', 'payee id']
latlng_columns = ['latitude', 'longitude']
merchant_columns = ['mdname', 'specialty description', 'clinic address']

except_columns = user_id_columns + latlng_columns + merchant_columns


def upload_fraud_data(file):
    wb = load_workbook(file, read_only=True)

    for sheet in wb.get_sheet_names():
        ws = wb.get_sheet_by_name(sheet)

        rows = ws.iter_rows()

        columnrow = rows.next()
        actualcolumns = []

        tablecolumns = []
        tablecolumns_index = {}

        # data_types = {}

        table_name = create_table_name(sheet)
        metadata = MetaData(bind=engine)

        is_table_non_transaction = True if 'leave' in table_name.lower() else False

        for cell in columnrow:
            if cell.value is not None:
                actualcolumns.append(cell.value)

            if cell.value is None or cell.value.lower() in except_columns:
                continue

            col = slugify(cell.value)
            tablecolumns_index[str(cell.value)] = col
            tablecolumns.append(col)

        # create the table
        if is_table_non_transaction:
            table = Table(table_name, metadata,
                          Column('id', Integer, primary_key=True),
                          Column('userid', Integer, ForeignKey(User.id), nullable=False),
                          *(Column(colname, String()) for colname in tablecolumns))
        else:
            table = Table(table_name, metadata,
                          Column('id', Integer, primary_key=True),
                          Column('transactionid', Integer, ForeignKey(Transaction.id), nullable=False),
                          *(Column(colname, String()) for colname in tablecolumns))

        if not table.exists():
            table.create()

        values = []

        for row in rows:
            dct = {}
            latlng = {}
            userid = None
            merchant_data = {}

            if len([c for c in row if c.value is not None]) == 0:
                continue

            for cell in row:
                try:
                    cls = tablecolumns_index[actualcolumns[cell.column - 1]]
                    if str(cls).lower() not in except_columns:
                        if cell.value is not None or cell.value != '':
                            dct[cls] = cell.value
                            # data_types[cls] = cell.data_type
                            # app.logger.info("{0} : {1}".format(cls, cell.value))
                        else:
                            dct[cls] = None
                except KeyError as e:
                    key = str(e).strip().lower()

                    if len([s for s in user_id_columns if s in key]) > 0:
                        if is_table_non_transaction:
                            dct['userid'] = cell.value
                        else:
                            userid = cell.value
                    elif len([s for s in latlng_columns if s in key]) > 0:
                        if 'latitude' in key:
                            latlng['lat'] = cell.value
                        elif 'longitude' in key:
                            latlng['lng'] = cell.value
                    elif len([s for s in merchant_columns if s in key]) > 0:
                        if "mdname" in key:
                            merchant_data['name'] = cell.value
                        elif "specialty description" in key:
                            merchant_data['specialty'] = cell.value.upper()
                        elif "clinic address" in key:
                            merchant_data['address'] = cell.value
                except Exception as error:
                        print "ERROR: {0}".format(error)

            # print "DATA TYPES: {0}".format(data_types)

            try:
                if userid is not None and latlng['lat'] is not None \
                        and latlng['lng'] is not None and not is_table_non_transaction:
                    # save merchant
                    merchantid = None
                    if bool(merchant_data):
                        merchant_data['latlng'] = latlng
                        # app.logger.info("CREATE MERCHANT: {0}".format(merchant_data))
                        merchant = create_merchant(merchant_data)
                        merchantid = merchant.id

                    address = merchant_data['address'] if 'address' in merchant_data else None
                    transaction_date = clean_date(dct['visit_date']) if 'visit_date' in dct else None

                    transaction = create_transaction(userid, latlng, sheet.upper(), merchantid, address, transaction_date)

                    if transaction is not None and transaction.id is not None:
                        dct['transactionid'] = transaction.id
                        values.append(dct)

                elif is_table_non_transaction:
                    values.append(dct)
            except:
                pass

        try:
            app.logger.info("INSERTING DATA TO {0}".format(table_name))
            engine.execute(table.insert().values(values))
            app.logger.info("FINISH!")
        except Exception as err:
            app.logger.info("ERROR INSERTING: {0}".format(err))


# def make_table(table_name, fields):
#     metadata = MetaData
#     columns = [_create_column(*field) for field in reader.fields]
#     table = Table(table_name, metadata, *columns)
#     if not table.exists():
#         table.create()
#     return table


# def upload_photo(solar_id, uploaded_file):
#     # Prepare Data
#     solar = Solar.query.get(solar_id)
#
#     if solar is None:
#         raise SolarNotFoundError("Solar id={0} not found".format(solar_id))
#
#     if uploaded_file is not None:
#         upload = UploadResource()
#         filename = upload.copy_file(uploaded_file)
#         file_ext = upload.get_file_extension(filename)
#         solar_file = SolarFile(file_name=filename,
#                                type=file_ext)
#         solar.files.append(solar_file)
#         db.session.commit()
#         return solar_file
#
#     return None
