from app import app
import requests
import json


def reverse_geocode(latlng_dict):
    url = 'https://maps.googleapis.com/maps/api/geocode/json??key=' + app.config.get('GOOGLE_MAP_API_KEY')
    url += '&latlng=' + str(latlng_dict['lat']) + ',' + str(latlng_dict['lng'])

    response = requests.get(url, verify=False)

    if response.content:
        content = json.loads(response.content)
        if content['status'] == 'OK' and len(content['results']) > 0:
            result = content['results']
            return result[0]['formatted_address']

    return ''


def geocode(address):
    print "GEOCODING ADDRESS: {0}".format(address)
    url = 'https://maps.googleapis.com/maps/api/geocode/json??key=' + app.config.get('GOOGLE_MAP_API_KEY')
    url += '&address=' + address

    print url

    response = requests.get(url, verify=False)

    if response.content:
        content = json.loads(response.content)
        if content['status'] == 'OK' and len(content['results']) > 0:
            result = content['results']
            return result[0]

    return None
