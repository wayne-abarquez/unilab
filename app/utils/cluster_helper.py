from math import log, sin, sqrt, pow
from geoalchemy2.shape import to_shape
from shapely.geometry import Point
from shapely.wkt import dumps
from copy import copy


class Cluster:
    """Server-Side Clustering for Map"""
    DEFAULT_MIN_ZOOM = 3
    DEFAULT_MAX_ZOOM = 17
    OFFSET = 268435456
    RADIUS = 85445659.4471
    PI = 3.141592653589793238462

    def __init__(self, entity_table, cluster_table):
        self.entity_table = entity_table
        self.cluster_table = cluster_table

    def lon_to_x(self, lon):
        return round(self.OFFSET + self.RADIUS * lon * self.PI / 180)

    def lat_to_y(self, lat):
        return round(
            self.OFFSET - self.RADIUS * log((1 + sin(lat * self.PI / 180)) / (1 - sin(lat * self.PI / 180))) / 2)

    def pixel_distance(self, lat1, lon1, lat2, lon2, zoom):
        x1 = self.lon_to_x(lon1)
        y1 = self.lat_to_y(lat1)

        x2 = self.lon_to_x(lon2)
        y2 = self.lat_to_y(lat2)

        # return int((x1-x2) + (y1-y2)) >> (21 - zoom)
        # old func
        return int(sqrt(pow((x1 - x2), 2) + pow((y1 - y2), 2))) >> (21 - zoom)

    def new_cluster_point(self, x1, x2, y1, y2, move_percent):
        new_point = []

        pixel = sqrt(pow((x1 - x2), 2) + pow((y1 - y2), 2))

        if pixel == 0:
            cosin = 0
            sinus = 0
        else:
            cosin = (x1 - x2) / pixel
            sinus = (y1 - y2) / pixel

        distance_move_pixel = pixel * move_percent
        new_x_move = cosin * distance_move_pixel
        new_y_move = sinus * distance_move_pixel

        new_point.insert(0, x1 - new_x_move)
        new_point.insert(1, y1 - new_y_move)

        # print "New Cluster Point: {0}".format(new_point)

        return new_point

    def create_cluster(self, location_points, zoom, distance=100, more_then=0):
        if more_then > 0:
            more_then -= 1
        if more_then < 0:
            more_then = 0

        clusters = []

        location_points_copy = copy(location_points)

        location_points_len = len(location_points_copy)
        location_points_inner_len = len(location_points_copy)

        # while len(location_points_copy):
        # print "Location Points Copy Length: {0}".format(len(location_points_copy))
        while location_points_len:
            print "Location Points Copy Length: {0}".format(location_points_len)

            marker = location_points_copy.pop(0)

            # Subtract len after popping
            location_points_len -= 1
            location_points_inner_len -= 1

            cluster = 0
            cluster_finder_index = []
            move_percent = 0.5

            # location_points_inner_len = len(location_points_copy)
            print "Location Points Copy Inner Length: {0}".format(location_points_inner_len)

            # for j in xrange(0, location_points_inner_len):
            for j in xrange(0, location_points_inner_len):

                marker_inner = location_points_copy[j]

                # Compute the Distance By Pixel
                # Converting meters to pixel
                pixel = self.pixel_distance(
                    marker.y,
                    marker.x,
                    marker_inner.y,
                    marker_inner.x,
                    zoom
                )

                if distance > pixel:
                    cluster += 1
                    cluster_finder_index.append(marker_inner)

                    cluster_point = self.new_cluster_point(
                        marker.x,
                        marker_inner.x,
                        marker.y,
                        marker_inner.y,
                        move_percent
                    )
                    move_percent -= (move_percent * 0.03)

            cluster_data = {'zoom': zoom}

            if cluster > more_then:
                cluster_finder_index_len = len(cluster_finder_index)
                for k in xrange(0, cluster_finder_index_len):
                    location_points_copy.remove(cluster_finder_index[k])
                    location_points_len -= 1
                    location_points_inner_len -= 1

                point = Point(cluster_point[0], cluster_point[1])
                cluster_data.update({'count': cluster + 1, 'coordinates': dumps(point)})
            else:
                # if type(marker) is self.entity_table:
                cluster_data['entity_id'] = marker.id
                cluster_data.update({'count': 1, 'coordinates': dumps(Point(marker.x, marker.y))})

            clusters.append(self.cluster_table.from_dict(cluster_data))

            # print "Location Points Length: {0}".format(len(location_points_copy))
            print "Location Points Length: {0}".format(location_points_len)
            print "Clustering..."

        return clusters