from flask.ext.restful import fields
from geoalchemy2.shape import to_shape


class PointToLatLng(fields.Raw):
    """
    Convert PostGIS POINT Geometry to {lat=pt.y,lng=pt.x}
    """

    def format(self, value):
        point = to_shape(value)
        # return {'lat': point.y, 'lng': point.x}
        return dict(lat=point.y, lng=point.x)


class PointToLatLngDict(fields.Raw):
    def format(self, value):
        return dict(lat=value.y, lng=value.x)


class PointToLatitude(fields.Raw):
    """
    Return latitude value of a PostGIS POINT Geometry
    """

    def format(self, value):
        point = to_shape(value)
        return point.y


class PointToLongitude(fields.Raw):
    """
    Return longitude value of a PostGIS POINT Geometry
    """

    def format(self, value):
        point = to_shape(value)
        return point.x


class PolygonToLatLng(fields.Raw):
    """
    Convert PostGIS POLYGON Geometry to [{lat=pt.y,lng=pt.x}]
    """

    def format(self, value):
        polygon = to_shape(value)
        return [dict(lat=point[1], lng=point[0]) for point in polygon.exterior.coords]


class LinestringToLatLng(fields.Raw):
    """
    Convert PostGIS Linestring Geometry to [{lat=pt.y,lng=pt.x}]
    """

    def format(self, value):
        linestring = to_shape(value)
        return [dict(lat=point[1], lng=point[0]) for point in linestring.coords]


# jling
class DecimalToDMS(fields.Raw):
    """
    Convert PostGIS POLYGON Geometry to Deg Min Sec Direction
    """
    degreeChar = u'\N{DEGREE SIGN}'

    def format(self, value, type):
        point = to_shape(value)

        if type == 'latitude':
            point = point.y
        else:
            point = point.x

        is_positive = point >= 0
        dd = abs(point)
        minutes, seconds = divmod(dd * 3600, 60)
        degrees, minutes = divmod(minutes, 60)
        if type == 'latitude':
            direction = 'N' if is_positive else 'S'
        else:
            direction = 'E' if is_positive else 'W'
        return str(direction) + ' ' + str(int(degrees)) + self.degreeChar + ' ' + str(int(minutes)) + '\' ' + str(
            round(seconds, 2)) + '"'
