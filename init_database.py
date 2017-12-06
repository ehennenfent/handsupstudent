# Run once to populate database with initial values

import json
from pprint import pprint

with open('default_data.json', 'r') as jsonfile:
    default_data = json.loads(jsonfile.read())

from firebase import firebase
firebase = firebase.FirebaseApplication('https://hands-up-f011c.firebaseio.com/', None)
result = firebase.delete('/users', None)
result = firebase.put('/', 'users', default_data)
print result
