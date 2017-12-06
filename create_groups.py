#!/usr/bin/python
# Assigns students into discussion groups at 10:30 pm every night. Weights group
# selection based on the number of participation points each student has. Sends
# emails to students who are selected to be in the first group.
# Add the following line to your user crontab in order to activate:
# 30 22 * * * ~/create_group.py
import math, random
from numpy.random import normal
from numpy import histogram

from firebase import firebase
firebase = firebase.FirebaseApplication('https://hands-up-f011c.firebaseio.com/', None)
students = firebase.get('/users', None)

groups = []
already_grouped_list = []
group_size = 5 # need to determine ideal group size for a given class size based on user research
num_students = len(students)
# scale down normal distribution so that the highest ranked student is about 3
# standard deviations out
selector = normal(loc=0.0, scale=0.3, size=100*num_students)

# massage normal distribution to fit data
def convert_to_index(norm):
    norm = abs(norm)
    norm *= num_students
    return int(math.floor(norm))
selector = [convert_to_index(k) for k in selector]
selector = filter(lambda k : k >= 0 and k < num_students, selector)


# print out histogram
print "Chance of getting called on based on class ranking (low to high) (before volunteering)"
hist = histogram(selector, bins=num_students)[0]
for idx, k in enumerate(hist):
    print '%02s : %s' % (idx, '*'*(int(k/10)))
print

def add_to_group(key):
    """ Adds students to the current group, creating new groups as needed """
    if len(groups) == 0:
        groups.append([])
    for idx, group in enumerate(groups):
        if len(group) < group_size:
            group.append(key)
            already_grouped_list.append(key)
            students[key][u'group'] = idx
            return
    groups.append([])
    add_to_group(key)

sorting_list = []

# Give the students who volunteered first priority
for key in sorted(students.keys(), key = lambda k: random.random()):
    if students[key][u'did_volunteer']:
        add_to_group(key)
        students[key][u'did_volunteer'] = False
    else:
        sorting_list.append((key))

# sort remaining students by class ranking (low to high) and massage normal distribution
# again to fit remaining students
sorting_list = sorted(sorting_list, key=lambda k: students[k][u'score'])
selector = filter(lambda k : k >= 0 and k < len(sorting_list), selector)

# select students according to normal distribution
for j in selector:
    if sorting_list[j] not in already_grouped_list:
        add_to_group(sorting_list[j])

# Add any students we missed at the back of the line
for i in sorting_list:
    if i not in already_grouped_list:
        add_to_group(i)

# Print out group members
for idx, group in enumerate(groups):
    print "Group %s:" % idx
    for member in group:
        student = students[member]
        print "  %s : %s %s" % (student[u'name'], student[u'score'], '(Volunteer)' if (member not in sorting_list) else '')

def send_email(name, address):
    """ We don't actually send emails because we're not getting graded on our
        ability to use smtplib, but you get the idea """
    print("\nSending email to %s\n... Sent!\n" % address)

# pretend to send emails to students in the first group
for student in groups[0]:
    student = students[student]
    send_email(student[u'name'], student[u'email'])

# push group assignments to database so we can get them from the app
print "Updating Groups in database..."
for student in students:
    firebase.put('/users/', student, students[student])
print "Done!"
