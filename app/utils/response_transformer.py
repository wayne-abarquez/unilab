import re


def convert_bounds_to_gmap_bounds_literal(bounds):
    if bounds is not None:
        bounds_str = re.sub("[()']", '', str(bounds)).strip('BOX')
        bounds_str = re.sub("[,]", ' ', bounds_str)
        bounds_arr = bounds_str.split(' ')

        return {
            'south': float(bounds_arr[1]),
            'west': float(bounds_arr[0]),
            'north': float(bounds_arr[3]),
            'east': float(bounds_arr[2])
        }
    return None


def to_dict(obj):
    d = {}
    for k, v in obj.__dict__.iteritems():
        if not k.startswith('_'):
            d[k] = v
    return d