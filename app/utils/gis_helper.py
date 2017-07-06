from sqlalchemy import func


class GISHelper:
    @staticmethod
    def bounds_to_box(bounds):
        points = bounds.split(',')

        if len(points) < 4:
            return None

        box = 'BOX(' + points[1] + ' ' + points[0] + ',' + \
              points[3] + ' ' + points[2] + ')'

        return box

    @staticmethod
    def make_bound_box(box):
        return func.ST_Envelope(
            func.box2d(box),
            srid=4326)